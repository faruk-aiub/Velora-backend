import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, CreateVariantDto, UpdateVariantDto, CreateImageDto } from './dto/products.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(page?: number, limit?: number, categoryId?: string, brandId?: string, minPrice?: number, maxPrice?: number, sort?: string, q?: string): Promise<import("../../common/utils/pagination.util").PaginatedResponse<any>>;
    findOne(slug: string): Promise<{
        data: {
            id: string;
            slug: string;
            brand: {
                id: string;
                name: string;
            } | null;
            category: {
                id: string;
                name: string;
                slug: string;
            };
            title: string;
            description: string | null;
            variants: {
                id: string;
                sku: string;
                price: import("@prisma/client-runtime-utils").Decimal;
                compare_price: import("@prisma/client-runtime-utils").Decimal | null;
                attributes: import("@prisma/client/runtime/client").JsonValue;
                inventory: {
                    quantity: number;
                    reserved_quantity: number;
                } | null;
            }[];
            images: {
                url: string;
                id: string;
                alt_text: string | null;
                sort_order: number;
            }[];
        };
    }>;
    create(createDto: CreateProductDto): Promise<{
        message: string;
        data: {
            id: string;
            slug: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            title: string;
            description: string | null;
            base_price: number;
            is_active: boolean;
            brand_id: string | null;
            category_id: string;
        };
    }>;
    update(id: string, updateDto: UpdateProductDto): Promise<{
        message: string;
        data: {
            id: string;
            slug: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            title: string;
            description: string | null;
            base_price: number;
            is_active: boolean;
            brand_id: string | null;
            category_id: string;
        };
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
    addVariant(id: string, variantDto: CreateVariantDto): Promise<{
        message: string;
        data: {
            inventory: {
                id: string;
                updated_at: Date;
                quantity: number;
                reserved_quantity: number;
                product_variant_id: string;
            } | null;
        } & {
            id: string;
            created_at: Date;
            updated_at: Date;
            sku: string;
            price: import("@prisma/client-runtime-utils").Decimal;
            compare_price: import("@prisma/client-runtime-utils").Decimal | null;
            attributes: import("@prisma/client/runtime/client").JsonValue | null;
            product_id: string;
        };
    }>;
    updateVariant(id: string, variantDto: UpdateVariantDto): Promise<{
        message: string;
        data: {
            id: string;
            created_at: Date;
            updated_at: Date;
            sku: string;
            price: import("@prisma/client-runtime-utils").Decimal;
            compare_price: import("@prisma/client-runtime-utils").Decimal | null;
            attributes: import("@prisma/client/runtime/client").JsonValue | null;
            product_id: string;
        };
    }>;
    removeVariant(id: string): Promise<{
        message: string;
    }>;
    addImage(id: string, imageDto: CreateImageDto): Promise<{
        message: string;
        data: {
            url: string;
            id: string;
            created_at: Date;
            alt_text: string | null;
            sort_order: number;
            product_id: string;
        };
    }>;
    removeImage(id: string): Promise<{
        message: string;
    }>;
}
