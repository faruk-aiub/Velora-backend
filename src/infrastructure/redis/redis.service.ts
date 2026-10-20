import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly redis: Redis;
  private readonly logger = new Logger(RedisService.name);
  private isConnected = false;
  private lastLoggedErrorTime = 0;

  constructor(private readonly configService: ConfigService) {
    const redisUrl =
      this.configService.get<string>('REDIS_URL') ||
      process.env.REDIS_URL ||
      'redis://localhost:6379';

    this.redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      lazyConnect: true,
      retryStrategy: (times) => {
        // Exponential backoff capped at 10 seconds
        return Math.min(times * 1000, 10000);
      },
    });

    this.redis.on('connect', () => {
      this.isConnected = true;
      this.logger.log('Redis connected successfully');
    });

    this.redis.on('ready', () => {
      this.isConnected = true;
    });

    this.redis.on('close', () => {
      this.isConnected = false;
    });

    this.redis.on('error', (err) => {
      this.isConnected = false;
      // Throttle connection error logging to once every 10 seconds to prevent log flooding
      const now = Date.now();
      if (now - this.lastLoggedErrorTime > 10000) {
        this.lastLoggedErrorTime = now;
        this.logger.warn(`Redis connection unavailable (${err.message || 'ECONNREFUSED'}). Caching operations will gracefully fallback.`);
      }
    });
  }

  async onModuleInit() {
    try {
      await this.redis.connect();
    } catch (err: any) {
      this.logger.warn(`Redis initial connection could not be established (${err.message}). Application will continue with database fallbacks.`);
    }
  }

  async onModuleDestroy() {
    try {
      await this.redis.quit();
    } catch {
      this.redis.disconnect();
    }
  }

  /**
   * Retrieves a cached value or executes the fallback function to get and cache the value.
   * If Redis is unreachable, seamlessly executes fallback directly without throwing.
   * @param key Redis cache key
   * @param ttl Time to live in seconds
   * @param fallback Function to execute if cache miss or Redis down
   */
  private readonly memoryCache = new Map<string, { value: any; expiry: number }>();

  async getOrSet<T>(key: string, ttl: number, fallback: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const mem = this.memoryCache.get(key);
    if (mem && now < mem.expiry) {
      return mem.value as T;
    }

    if (this.isConnected) {
      try {
        const cached = await this.redis.get(key);
        if (cached) {
          const parsed = JSON.parse(cached) as T;
          this.memoryCache.set(key, { value: parsed, expiry: now + ttl * 1000 });
          return parsed;
        }
      } catch (err: any) {
        this.logger.warn(`Redis get failed for key "${key}": ${err.message}. Fetching from source.`);
      }
    }

    const value = await fallback();
    if (value) {
      this.memoryCache.set(key, { value, expiry: now + ttl * 1000 });
      if (this.isConnected) {
        try {
          await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
        } catch (err: any) {
          this.logger.warn(`Redis set failed for key "${key}": ${err.message}`);
        }
      }
    }
    return value;
  }

  async set(key: string, value: any, ttl?: number) {
    const now = Date.now();
    const expiry = ttl ? now + ttl * 1000 : now + 3600 * 1000;
    this.memoryCache.set(key, { value, expiry });

    if (!this.isConnected) return;
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.redis.set(key, serialized, 'EX', ttl);
      } else {
        await this.redis.set(key, serialized);
      }
    } catch (err: any) {
      this.logger.warn(`Redis set failed for key "${key}": ${err.message}`);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const now = Date.now();
    const mem = this.memoryCache.get(key);
    if (mem && now < mem.expiry) {
      return mem.value as T;
    }

    if (!this.isConnected) return null;
    try {
      const val = await this.redis.get(key);
      if (val) {
        const parsed = JSON.parse(val) as T;
        this.memoryCache.set(key, { value: parsed, expiry: now + 300 * 1000 });
        return parsed;
      }
      return null;
    } catch (err: any) {
      this.logger.warn(`Redis get failed for key "${key}": ${err.message}`);
      return null;
    }
  }

  async del(key: string) {
    this.memoryCache.delete(key);
    if (!this.isConnected) return;
    try {
      await this.redis.del(key);
    } catch (err: any) {
      this.logger.warn(`Redis del failed for key "${key}": ${err.message}`);
    }
  }

  async delByPattern(pattern: string) {
    const regexPattern = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const k of this.memoryCache.keys()) {
      if (regexPattern.test(k)) {
        this.memoryCache.delete(k);
      }
    }

    if (!this.isConnected) return;
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (err: any) {
      this.logger.warn(`Redis delByPattern failed for pattern "${pattern}": ${err.message}`);
    }
  }
}
