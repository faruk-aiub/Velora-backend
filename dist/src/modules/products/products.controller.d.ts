import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, CreateVariantDto, UpdateVariantDto, CreateImageDto } from './dto/products.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(page?: number, limit?: number, categoryId?: string, brandId?: string, minPrice?: number, maxPrice?: number): Promise<import("../../common/utils/pagination.util").PaginatedResponse<any>>;
    findOne(slug: string): Promise<{
        data: {
            category: {
                name: string;
                id: string;
                slug: string;
            };
            brand: {
                name: string;
                id: string;
            } | null;
            description: string | null;
            title: string;
            id: string;
            slug: string;
            variants: {
                inventory: {
                    quantity: number;
                    reserved_quantity: number;
                } | null;
                id: string;
                sku: string;
                price: import("@prisma/client-runtime-utils").Decimal;
                compare_price: import("@prisma/client-runtime-utils").Decimal | null;
                attributes: import("@prisma/client/runtime/client").JsonValue;
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
            description: string | null;
            title: string;
            id: string;
            is_active: boolean;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            brand_id: string | null;
            category_id: string;
            slug: string;
        };
    }>;
    update(id: string, updateDto: UpdateProductDto): Promise<{
        message: string;
        data: {
            description: string | null;
            title: string;
            id: string;
            is_active: boolean;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            brand_id: string | null;
            category_id: string;
            slug: string;
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
                product_variant_id: string;
                quantity: number;
                reserved_quantity: number;
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
