import { PrismaService } from '../../database/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
export declare class CategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getCategoryTree(): Promise<({
        children: ({
            children: {
                id: string;
                created_at: Date;
                updated_at: Date;
                deleted_at: Date | null;
                name: string;
                slug: string;
                parent_id: string | null;
                image_url: string | null;
            }[];
        } & {
            id: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            name: string;
            slug: string;
            parent_id: string | null;
            image_url: string | null;
        })[];
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        name: string;
        slug: string;
        parent_id: string | null;
        image_url: string | null;
    })[]>;
    getCategories(): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        name: string;
        slug: string;
        parent_id: string | null;
        image_url: string | null;
    }[]>;
    createCategory(dto: CreateCategoryDto): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        name: string;
        slug: string;
        parent_id: string | null;
        image_url: string | null;
    }>;
    updateCategory(id: string, dto: UpdateCategoryDto): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        name: string;
        slug: string;
        parent_id: string | null;
        image_url: string | null;
    }>;
    deleteCategory(id: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        name: string;
        slug: string;
        parent_id: string | null;
        image_url: string | null;
    }>;
}
