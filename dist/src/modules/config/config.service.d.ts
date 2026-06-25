import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { UpsertConfigDto } from './dto/config.dto';
export declare class ConfigService {
    private readonly prisma;
    private readonly redisService;
    private readonly CACHE_KEY;
    constructor(prisma: PrismaService, redisService: RedisService);
    getGlobalConfig(): Promise<any>;
    getAllAdmin(): Promise<{
        id: string;
        updated_at: Date;
        description: string | null;
        key: string;
        value: string;
    }[]>;
    upsertConfig(dto: UpsertConfigDto): Promise<{
        id: string;
        updated_at: Date;
        description: string | null;
        key: string;
        value: string;
    }>;
    deleteConfig(key: string): Promise<boolean>;
    private invalidateCache;
}
