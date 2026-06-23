import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { UpsertConfigDto } from './dto/config.dto';

@Injectable()
export class ConfigService {
  private readonly CACHE_KEY = 'app:global_config';

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService
  ) {}

  // --- PUBLIC ENDPOINTS ---

  async getGlobalConfig() {
    const cached = await this.redisService.get(this.CACHE_KEY);
    if (cached) return JSON.parse(cached as string);

    const configs = await this.prisma.appConfig.findMany();
    
    // Convert array of {key, value} to a dictionary object
    const configMap = configs.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    await this.redisService.set(this.CACHE_KEY, JSON.stringify(configMap)); // No TTL, cache indefinitely until invalidated
    return configMap;
  }

  // --- ADMIN ENDPOINTS ---

  async getAllAdmin() {
    return this.prisma.appConfig.findMany({
      orderBy: { key: 'asc' }
    });
  }

  async upsertConfig(dto: UpsertConfigDto) {
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

  async deleteConfig(key: string) {
    const config = await this.prisma.appConfig.findUnique({ where: { key } });
    if (!config) throw new NotFoundException('Config key not found');

    await this.prisma.appConfig.delete({ where: { key } });
    await this.invalidateCache();
    return true;
  }

  private async invalidateCache() {
    await this.redisService.del(this.CACHE_KEY);
  }
}
