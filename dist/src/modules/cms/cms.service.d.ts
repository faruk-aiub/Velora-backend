import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { CreateBannerDto, UpdateBannerDto } from './dto/cms.dto';
export declare class CmsService {
    private readonly prisma;
    private readonly redisService;
    private readonly CACHE_KEY;
    constructor(prisma: PrismaService, redisService: RedisService);
    getActiveBanners(): Promise<any>;
    createBanner(dto: CreateBannerDto): Promise<{
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        title: string;
        image_url: string;
        link_url: string | null;
        position: number;
    }>;
    getAllBannersAdmin(): Promise<{
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        title: string;
        image_url: string;
        link_url: string | null;
        position: number;
    }[]>;
    updateBanner(id: string, dto: UpdateBannerDto): Promise<{
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        title: string;
        image_url: string;
        link_url: string | null;
        position: number;
    }>;
    deleteBanner(id: string): Promise<boolean>;
    private invalidateCache;
}
