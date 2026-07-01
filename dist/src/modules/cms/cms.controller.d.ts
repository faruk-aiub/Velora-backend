import { CmsService } from './cms.service';
import { CreateBannerDto, UpdateBannerDto } from './dto/cms.dto';
export declare class CmsController {
    private readonly cmsService;
    constructor(cmsService: CmsService);
    getActiveBanners(): Promise<{
        data: any;
    }>;
    getAllBannersAdmin(): Promise<{
        data: {
            id: string;
            is_active: boolean;
            created_at: Date;
            updated_at: Date;
            title: string;
            image_url: string;
            link_url: string | null;
            position: number;
        }[];
    }>;
    createBanner(dto: CreateBannerDto): Promise<{
        message: string;
        data: {
            id: string;
            is_active: boolean;
            created_at: Date;
            updated_at: Date;
            title: string;
            image_url: string;
            link_url: string | null;
            position: number;
        };
    }>;
    updateBanner(id: string, dto: UpdateBannerDto): Promise<{
        message: string;
        data: {
            id: string;
            is_active: boolean;
            created_at: Date;
            updated_at: Date;
            title: string;
            image_url: string;
            link_url: string | null;
            position: number;
        };
    }>;
    deleteBanner(id: string): Promise<{
        message: string;
    }>;
}
