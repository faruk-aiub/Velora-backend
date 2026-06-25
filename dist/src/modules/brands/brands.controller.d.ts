import { BrandsService } from './brands.service';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';
export declare class BrandsController {
    private readonly brandsService;
    constructor(brandsService: BrandsService);
    getBrands(): Promise<{
        data: {
            id: string;
            name: string;
            slug: string;
            logo_url: string | null;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
        }[];
    }>;
    createBrand(createDto: CreateBrandDto): Promise<{
        message: string;
        data: {
            id: string;
            name: string;
            slug: string;
            logo_url: string | null;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
        };
    }>;
    updateBrand(id: string, updateDto: UpdateBrandDto): Promise<{
        message: string;
        data: {
            id: string;
            name: string;
            slug: string;
            logo_url: string | null;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
        };
    }>;
    deleteBrand(id: string): Promise<{
        message: string;
    }>;
}
