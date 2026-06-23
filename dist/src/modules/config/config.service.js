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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const redis_service_1 = require("../../infrastructure/redis/redis.service");
let ConfigService = class ConfigService {
    prisma;
    redisService;
    CACHE_KEY = 'app:global_config';
    constructor(prisma, redisService) {
        this.prisma = prisma;
        this.redisService = redisService;
    }
    async getGlobalConfig() {
        const cached = await this.redisService.get(this.CACHE_KEY);
        if (cached)
            return JSON.parse(cached);
        const configs = await this.prisma.appConfig.findMany();
        const configMap = configs.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        await this.redisService.set(this.CACHE_KEY, JSON.stringify(configMap));
        return configMap;
    }
    async getAllAdmin() {
        return this.prisma.appConfig.findMany({
            orderBy: { key: 'asc' }
        });
    }
    async upsertConfig(dto) {
        const config = await this.prisma.appConfig.upsert({
            where: { key: dto.key },
            update: {
                value: dto.value,
                description: dto.description
            },
            create: {
                key: dto.key,
                value: dto.value,
                description: dto.description
            }
        });
        await this.invalidateCache();
        return config;
    }
    async deleteConfig(key) {
        const config = await this.prisma.appConfig.findUnique({ where: { key } });
        if (!config)
            throw new common_1.NotFoundException('Config key not found');
        await this.prisma.appConfig.delete({ where: { key } });
        await this.invalidateCache();
        return true;
    }
    async invalidateCache() {
        await this.redisService.del(this.CACHE_KEY);
    }
};
exports.ConfigService = ConfigService;
exports.ConfigService = ConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], ConfigService);
//# sourceMappingURL=config.service.js.map