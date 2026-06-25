import { PrismaService } from '../../database/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
export declare class CategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getCategoryTree(): Promise<({
        children: ({
            children: {
                id: string;
                name: string;
                slug: string;
                created_at: Date;
                updated_at: Date;
                deleted_at: Date | null;
                image_url: string | null;
                parent_id: string | null;
            }[];
        } & {
            id: string;
            name: string;
            slug: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            image_url: string | null;
            parent_id: string | null;
        })[];
    } & {
        id: string;
        name: string;
        slug: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        image_url: string | null;
        parent_id: string | null;
    })[]>;
    getCategories(): Promise<{
        id: string;
        name: string;
        slug: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        image_url: string | null;
        parent_id: string | null;
    }[]>;
    createCategory(dto: CreateCategoryDto): Promise<{
        id: string;
        name: string;
        slug: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        image_url: string | null;
        parent_id: string | null;
    }>;
    updateCategory(id: string, dto: UpdateCategoryDto): Promise<{
        id: string;
        name: string;
        slug: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        image_url: string | null;
        parent_id: string | null;
    }>;
    deleteCategory(id: string): Promise<{
        id: string;
        name: string;
        slug: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        image_url: string | null;
        parent_id: string | null;
    }>;
}
