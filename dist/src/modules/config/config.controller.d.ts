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
            description: string | null;
            id: string;
            updated_at: Date;
            key: string;
            value: string;
        }[];
    }>;
    upsertConfig(dto: UpsertConfigDto): Promise<{
        message: string;
        data: {
            description: string | null;
            id: string;
            updated_at: Date;
            key: string;
            value: string;
        };
    }>;
    deleteConfig(key: string): Promise<{
        message: string;
    }>;
}
