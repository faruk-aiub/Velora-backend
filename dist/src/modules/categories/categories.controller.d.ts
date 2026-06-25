import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    getCategories(): Promise<{
        data: {
            id: string;
            name: string;
            slug: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            image_url: string | null;
            parent_id: string | null;
        }[];
    }>;
    getCategoryTree(): Promise<{
        data: ({
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
        })[];
    }>;
    createCategory(createDto: CreateCategoryDto): Promise<{
        message: string;
        data: {
            id: string;
            name: string;
            slug: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            image_url: string | null;
            parent_id: string | null;
        };
    }>;
    updateCategory(id: string, updateDto: UpdateCategoryDto): Promise<{
        message: string;
        data: {
            id: string;
            name: string;
            slug: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            image_url: string | null;
            parent_id: string | null;
        };
    }>;
    deleteCategory(id: string): Promise<{
        message: string;
    }>;
}
