import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly redis: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  async onModuleInit() {
    this.redis.on('connect', () => this.logger.log('Redis connected successfully'));
    this.redis.on('error', (err) => this.logger.error('Redis connection error', err));
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }

  /**
   * Retrieves a cached value or executes the fallback function to get and cache the value.
   * @param key Redis cache key
   * @param ttl Time to live in seconds
   * @param fallback Function to execute if cache miss
   */
  async getOrSet<T>(key: string, ttl: number, fallback: () => Promise<T>): Promise<T> {
    const cached = await this.redis.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }

    const value = await fallback();
    if (value) {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
    }
    return value;
  }

  async set(key: string, value: any, ttl?: number) {
    if (ttl) {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
    } else {
      await this.redis.set(key, JSON.stringify(value));
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const val = await this.redis.get(key);
    return val ? JSON.parse(val) : null;
  }

  async del(key: string) {
    await this.redis.del(key);
  }

  async delByPattern(pattern: string) {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
