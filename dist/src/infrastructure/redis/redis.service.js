"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = require("ioredis");
let RedisService = RedisService_1 = class RedisService {
    configService;
    redis;
    logger = new common_1.Logger(RedisService_1.name);
    isConnected = false;
    lastLoggedErrorTime = 0;
    constructor(configService) {
        this.configService = configService;
        const redisUrl = this.configService.get('REDIS_URL') ||
            process.env.REDIS_URL ||
            'redis://localhost:6379';
        this.redis = new ioredis_1.Redis(redisUrl, {
            maxRetriesPerRequest: 1,
            enableOfflineQueue: false,
            lazyConnect: true,
            retryStrategy: (times) => {
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
        }
        catch (err) {
            this.logger.warn(`Redis initial connection could not be established (${err.message}). Application will continue with database fallbacks.`);
        }
    }
    async onModuleDestroy() {
        try {
            await this.redis.quit();
        }
        catch {
            this.redis.disconnect();
        }
    }
    memoryCache = new Map();
    async getOrSet(key, ttl, fallback) {
        const now = Date.now();
        const mem = this.memoryCache.get(key);
        if (mem && now < mem.expiry) {
            return mem.value;
        }
        if (this.isConnected) {
            try {
                const cached = await this.redis.get(key);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    this.memoryCache.set(key, { value: parsed, expiry: now + ttl * 1000 });
                    return parsed;
                }
            }
            catch (err) {
                this.logger.warn(`Redis get failed for key "${key}": ${err.message}. Fetching from source.`);
            }
        }
        const value = await fallback();
        if (value) {
            this.memoryCache.set(key, { value, expiry: now + ttl * 1000 });
            if (this.isConnected) {
                try {
                    await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
                }
                catch (err) {
                    this.logger.warn(`Redis set failed for key "${key}": ${err.message}`);
                }
            }
        }
        return value;
    }
    async set(key, value, ttl) {
        const now = Date.now();
        const expiry = ttl ? now + ttl * 1000 : now + 3600 * 1000;
        this.memoryCache.set(key, { value, expiry });
        if (!this.isConnected)
            return;
        try {
            const serialized = JSON.stringify(value);
            if (ttl) {
                await this.redis.set(key, serialized, 'EX', ttl);
            }
            else {
                await this.redis.set(key, serialized);
            }
        }
        catch (err) {
            this.logger.warn(`Redis set failed for key "${key}": ${err.message}`);
        }
    }
    async get(key) {
        const now = Date.now();
        const mem = this.memoryCache.get(key);
        if (mem && now < mem.expiry) {
            return mem.value;
        }
        if (!this.isConnected)
            return null;
        try {
            const val = await this.redis.get(key);
            if (val) {
                const parsed = JSON.parse(val);
                this.memoryCache.set(key, { value: parsed, expiry: now + 300 * 1000 });
                return parsed;
            }
            return null;
        }
        catch (err) {
            this.logger.warn(`Redis get failed for key "${key}": ${err.message}`);
            return null;
        }
    }
    async del(key) {
        this.memoryCache.delete(key);
        if (!this.isConnected)
            return;
        try {
            await this.redis.del(key);
        }
        catch (err) {
            this.logger.warn(`Redis del failed for key "${key}": ${err.message}`);
        }
    }
    async delByPattern(pattern) {
        const regexPattern = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        for (const k of this.memoryCache.keys()) {
            if (regexPattern.test(k)) {
                this.memoryCache.delete(k);
            }
        }
        if (!this.isConnected)
            return;
        try {
            const keys = await this.redis.keys(pattern);
            if (keys.length > 0) {
                await this.redis.del(...keys);
            }
        }
        catch (err) {
            this.logger.warn(`Redis delByPattern failed for pattern "${pattern}": ${err.message}`);
        }
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map