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
const ioredis_1 = require("ioredis");
let RedisService = RedisService_1 = class RedisService {
    redis;
    logger = new common_1.Logger(RedisService_1.name);
    constructor() {
        this.redis = new ioredis_1.Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    }
    async onModuleInit() {
        this.redis.on('connect', () => this.logger.log('Redis connected successfully'));
        this.redis.on('error', (err) => this.logger.error('Redis connection error', err));
    }
    async onModuleDestroy() {
        await this.redis.quit();
    }
    async getOrSet(key, ttl, fallback) {
        const cached = await this.redis.get(key);
        if (cached) {
            return JSON.parse(cached);
        }
        const value = await fallback();
        if (value) {
            await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
        }
        return value;
    }
    async set(key, value, ttl) {
        if (ttl) {
            await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
        }
        else {
            await this.redis.set(key, JSON.stringify(value));
        }
    }
    async get(key) {
        const val = await this.redis.get(key);
        return val ? JSON.parse(val) : null;
    }
    async del(key) {
        await this.redis.del(key);
    }
    async delByPattern(pattern) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
            await this.redis.del(...keys);
        }
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], RedisService);
//# sourceMappingURL=redis.service.js.map