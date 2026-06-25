import { PrismaService } from '../../database/prisma.service';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';
export declare class BrandsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getBrands(): Promise<{
        id: string;
        name: string;
        slug: string;
        logo_url: string | null;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    }[]>;
    createBrand(dto: CreateBrandDto): Promise<{
        id: string;
        name: string;
        slug: string;
        logo_url: string | null;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    }>;
    updateBrand(id: string, dto: UpdateBrandDto): Promise<{
        id: string;
        name: string;
        slug: string;
        logo_url: string | null;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    }>;
    deleteBrand(id: string): Promise<{
        id: string;
        name: string;
        slug: string;
        logo_url: string | null;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    }>;
}
