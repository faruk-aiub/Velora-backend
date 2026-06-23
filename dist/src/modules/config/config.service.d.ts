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
        description: string | null;
        id: string;
        updated_at: Date;
        key: string;
        value: string;
    }[]>;
    upsertConfig(dto: UpsertConfigDto): Promise<{
        description: string | null;
        id: string;
        updated_at: Date;
        key: string;
        value: string;
    }>;
    deleteConfig(key: string): Promise<boolean>;
    private invalidateCache;
}
