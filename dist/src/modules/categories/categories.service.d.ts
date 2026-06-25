import { PrismaService } from '../../database/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
export declare class CategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getCategoryTree(): Promise<({
        children: ({
            children: {
                name: string;
                id: string;
                created_at: Date;
                updated_at: Date;
                deleted_at: Date | null;
                slug: string;
                parent_id: string | null;
                image_url: string | null;
            }[];
        } & {
            name: string;
            id: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            slug: string;
            parent_id: string | null;
            image_url: string | null;
        })[];
    } & {
        name: string;
        id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        slug: string;
        parent_id: string | null;
        image_url: string | null;
    })[]>;
    getCategories(): Promise<{
        name: string;
        id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        slug: string;
        parent_id: string | null;
        image_url: string | null;
    }[]>;
    createCategory(dto: CreateCategoryDto): Promise<{
        name: string;
        id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        slug: string;
        parent_id: string | null;
        image_url: string | null;
    }>;
    updateCategory(id: string, dto: UpdateCategoryDto): Promise<{
        name: string;
        id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        slug: string;
        parent_id: string | null;
        image_url: string | null;
    }>;
    deleteCategory(id: string): Promise<{
        name: string;
        id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        slug: string;
        parent_id: string | null;
        image_url: string | null;
    }>;
}
