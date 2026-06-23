import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, CreateVariantDto, UpdateVariantDto, CreateImageDto } from './dto/products.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(page?: number, limit?: number, categoryId?: string, brandId?: string, minPrice?: number, maxPrice?: number): Promise<import("../../common/utils/pagination.util").PaginatedResponse<any>>;
    findOne(slug: string): Promise<{
        data: {
            id: string;
            slug: string;
            title: string;
            description: string | null;
            brand: {
                id: string;
                name: string;
            } | null;
            category: {
                id: string;
                slug: string;
                name: string;
            };
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
                id: string;
                url: string;
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
            title: string;
            description: string | null;
            brand_id: string | null;
            category_id: string;
            is_active: boolean;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
        };
    }>;
    update(id: string, updateDto: UpdateProductDto): Promise<{
        message: string;
        data: {
            id: string;
            slug: string;
            title: string;
            description: string | null;
            brand_id: string | null;
            category_id: string;
            is_active: boolean;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
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
            product_id: string;
            sku: string;
            price: import("@prisma/client-runtime-utils").Decimal;
            compare_price: import("@prisma/client-runtime-utils").Decimal | null;
            attributes: import("@prisma/client/runtime/client").JsonValue | null;
        };
    }>;
    updateVariant(id: string, variantDto: UpdateVariantDto): Promise<{
        message: string;
        data: {
            id: string;
            created_at: Date;
            updated_at: Date;
            product_id: string;
            sku: string;
            price: import("@prisma/client-runtime-utils").Decimal;
            compare_price: import("@prisma/client-runtime-utils").Decimal | null;
            attributes: import("@prisma/client/runtime/client").JsonValue | null;
        };
    }>;
    removeVariant(id: string): Promise<{
        message: string;
    }>;
    addImage(id: string, imageDto: CreateImageDto): Promise<{
        message: string;
        data: {
            id: string;
            created_at: Date;
            product_id: string;
            url: string;
            alt_text: string | null;
            sort_order: number;
        };
    }>;
    removeImage(id: string): Promise<{
        message: string;
    }>;
}
