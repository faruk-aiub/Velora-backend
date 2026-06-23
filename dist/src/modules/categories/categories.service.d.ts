import { PrismaService } from '../../database/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
export declare class CategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getCategoryTree(): Promise<({
        children: ({
            children: {
                name: string;
                parent_id: string | null;
                image_url: string | null;
                id: string;
                slug: string;
                created_at: Date;
                updated_at: Date;
                deleted_at: Date | null;
            }[];
        } & {
            name: string;
            parent_id: string | null;
            image_url: string | null;
            id: string;
            slug: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
        })[];
    } & {
        name: string;
        parent_id: string | null;
        image_url: string | null;
        id: string;
        slug: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    })[]>;
    getCategories(): Promise<{
        name: string;
        parent_id: string | null;
        image_url: string | null;
        id: string;
        slug: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    }[]>;
    createCategory(dto: CreateCategoryDto): Promise<{
        name: string;
        parent_id: string | null;
        image_url: string | null;
        id: string;
        slug: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    }>;
    updateCategory(id: string, dto: UpdateCategoryDto): Promise<{
        name: string;
        parent_id: string | null;
        image_url: string | null;
        id: string;
        slug: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    }>;
    deleteCategory(id: string): Promise<{
        name: string;
        parent_id: string | null;
        image_url: string | null;
        id: string;
        slug: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    }>;
}
