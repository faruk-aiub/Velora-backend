import { ConfigService } from './config.service';
import { UpsertConfigDto } from './dto/config.dto';
export declare class ConfigController {
    private readonly configService;
    constructor(configService: ConfigService);
    getGlobalConfig(): Promise<{
        data: any;
    }>;
    getAllAdmin(): Promise<{
        data: {
            id: string;
            updated_at: Date;
            description: string | null;
            key: string;
            value: string;
        }[];
    }>;
    upsertConfig(dto: UpsertConfigDto): Promise<{
        message: string;
        data: {
            id: string;
            updated_at: Date;
            description: string | null;
            key: string;
            value: string;
        };
    }>;
    deleteConfig(key: string): Promise<{
        message: string;
    }>;
}
