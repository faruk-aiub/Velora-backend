import { BrandsService } from './brands.service';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';
export declare class BrandsController {
    private readonly brandsService;
    constructor(brandsService: BrandsService);
    getBrands(): Promise<{
        data: {
            id: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            name: string;
            slug: string;
            logo_url: string | null;
        }[];
    }>;
    createBrand(createDto: CreateBrandDto): Promise<{
        message: string;
        data: {
            id: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            name: string;
            slug: string;
            logo_url: string | null;
        };
    }>;
    updateBrand(id: string, updateDto: UpdateBrandDto): Promise<{
        message: string;
        data: {
            id: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            name: string;
            slug: string;
            logo_url: string | null;
        };
    }>;
    deleteBrand(id: string): Promise<{
        message: string;
    }>;
}
