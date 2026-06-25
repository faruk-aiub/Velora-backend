import { PrismaService } from '../../database/prisma.service';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';
export declare class BrandsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getBrands(): Promise<{
        name: string;
        id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        slug: string;
        logo_url: string | null;
    }[]>;
    createBrand(dto: CreateBrandDto): Promise<{
        name: string;
        id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        slug: string;
        logo_url: string | null;
    }>;
    updateBrand(id: string, dto: UpdateBrandDto): Promise<{
        name: string;
        id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        slug: string;
        logo_url: string | null;
    }>;
    deleteBrand(id: string): Promise<{
        name: string;
        id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        slug: string;
        logo_url: string | null;
    }>;
}
