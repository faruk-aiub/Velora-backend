import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    getCategories(): Promise<{
        data: {
            name: string;
            id: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            slug: string;
            parent_id: string | null;
            image_url: string | null;
        }[];
    }>;
    getCategoryTree(): Promise<{
        data: ({
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
        })[];
    }>;
    createCategory(createDto: CreateCategoryDto): Promise<{
        message: string;
        data: {
            name: string;
            id: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            slug: string;
            parent_id: string | null;
            image_url: string | null;
        };
    }>;
    updateCategory(id: string, updateDto: UpdateCategoryDto): Promise<{
        message: string;
        data: {
            name: string;
            id: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            slug: string;
            parent_id: string | null;
            image_url: string | null;
        };
    }>;
    deleteCategory(id: string): Promise<{
        message: string;
    }>;
}
