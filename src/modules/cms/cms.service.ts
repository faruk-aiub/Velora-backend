import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { CreateBannerDto, UpdateBannerDto } from './dto/cms.dto';

@Injectable()
export class CmsService {
  private readonly CACHE_KEY = 'cms:active_banners';

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService
  ) {}

  // --- PUBLIC ENDPOINTS ---

  async getActiveBanners() {
    const cached = await this.redisService.get(this.CACHE_KEY);
    if (cached) return JSON.parse(cached as string);

    const banners = await this.prisma.banner.findMany({
      where: { is_active: true },
      orderBy: { position: 'asc' }
    });

    await this.redisService.set(this.CACHE_KEY, JSON.stringify(banners), 3600); // 1 hour TTL
    return banners;
  }

  // --- ADMIN ENDPOINTS ---

  async createBanner(dto: CreateBannerDto) {
    const banner = await this.prisma.banner.create({ data: dto });
    await this.invalidateCache();
    return banner;
  }

  async getAllBannersAdmin() {
    return this.prisma.banner.findMany({
      orderBy: { position: 'asc' }
    });
  }

  async updateBanner(id: string, dto: UpdateBannerDto) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException('Banner not found');

    const updated = await this.prisma.banner.update({
      where: { id },
      data: dto
    });
    await this.invalidateCache();
    return updated;
  }

  async deleteBanner(id: string) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException('Banner not found');

    await this.prisma.banner.delete({ where: { id } });
    await this.invalidateCache();
    return true;
  }

  private async invalidateCache() {
    await this.redisService.del(this.CACHE_KEY);
  }
}
