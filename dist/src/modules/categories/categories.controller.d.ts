import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    getCategories(): Promise<{
        data: {
            id: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            name: string;
            slug: string;
            parent_id: string | null;
            image_url: string | null;
        }[];
    }>;
    getCategoryTree(): Promise<{
        data: ({
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
        })[];
    }>;
    createCategory(createDto: CreateCategoryDto): Promise<{
        message: string;
        data: {
            id: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            name: string;
            slug: string;
            parent_id: string | null;
            image_url: string | null;
        };
    }>;
    updateCategory(id: string, updateDto: UpdateCategoryDto): Promise<{
        message: string;
        data: {
            id: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            name: string;
            slug: string;
            parent_id: string | null;
            image_url: string | null;
        };
    }>;
    deleteCategory(id: string): Promise<{
        message: string;
    }>;
}
