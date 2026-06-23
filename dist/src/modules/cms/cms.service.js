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
exports.CmsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const redis_service_1 = require("../../infrastructure/redis/redis.service");
let CmsService = class CmsService {
    prisma;
    redisService;
    CACHE_KEY = 'cms:active_banners';
    constructor(prisma, redisService) {
        this.prisma = prisma;
        this.redisService = redisService;
    }
    async getActiveBanners() {
        const cached = await this.redisService.get(this.CACHE_KEY);
        if (cached)
            return JSON.parse(cached);
        const banners = await this.prisma.banner.findMany({
            where: { is_active: true },
            orderBy: { position: 'asc' }
        });
        await this.redisService.set(this.CACHE_KEY, JSON.stringify(banners), 3600);
        return banners;
    }
    async createBanner(dto) {
        const banner = await this.prisma.banner.create({ data: dto });
        await this.invalidateCache();
        return banner;
    }
    async getAllBannersAdmin() {
        return this.prisma.banner.findMany({
            orderBy: { position: 'asc' }
        });
    }
    async updateBanner(id, dto) {
        const banner = await this.prisma.banner.findUnique({ where: { id } });
        if (!banner)
            throw new common_1.NotFoundException('Banner not found');
        const updated = await this.prisma.banner.update({
            where: { id },
            data: dto
        });
        await this.invalidateCache();
        return updated;
    }
    async deleteBanner(id) {
        const banner = await this.prisma.banner.findUnique({ where: { id } });
        if (!banner)
            throw new common_1.NotFoundException('Banner not found');
        await this.prisma.banner.delete({ where: { id } });
        await this.invalidateCache();
        return true;
    }
    async invalidateCache() {
        await this.redisService.del(this.CACHE_KEY);
    }
};
exports.CmsService = CmsService;
exports.CmsService = CmsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], CmsService);
//# sourceMappingURL=cms.service.js.map