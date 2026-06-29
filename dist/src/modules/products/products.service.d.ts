import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { PaginatedResponse } from '../../common/utils/pagination.util';
import { CreateProductDto, UpdateProductDto, CreateVariantDto, UpdateVariantDto, CreateImageDto } from './dto/products.dto';
export declare class ProductsService {
    private readonly prisma;
    private readonly redis;
    constructor(prisma: PrismaService, redis: RedisService);
    private invalidateProductCaches;
    findAll(page?: number, limit?: number, categoryId?: string, brandId?: string, minPrice?: number, maxPrice?: number, sort?: string, search?: string): Promise<PaginatedResponse<any>>;
    findOneBySlug(slug: string): Promise<{
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
    }>;
    create(dto: CreateProductDto): Promise<{
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        slug: string;
        title: string;
        description: string | null;
        base_price: number;
        brand_id: string | null;
        category_id: string;
    }>;
    update(id: string, dto: UpdateProductDto): Promise<{
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        slug: string;
        title: string;
        description: string | null;
        base_price: number;
        brand_id: string | null;
        category_id: string;
    }>;
    delete(id: string): Promise<boolean>;
    addVariant(productId: string, dto: CreateVariantDto): Promise<{
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
    }>;
    updateVariant(variantId: string, dto: UpdateVariantDto): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        sku: string;
        price: import("@prisma/client-runtime-utils").Decimal;
        compare_price: import("@prisma/client-runtime-utils").Decimal | null;
        attributes: import("@prisma/client/runtime/client").JsonValue | null;
        product_id: string;
    }>;
    removeVariant(variantId: string): Promise<void>;
    addImage(productId: string, dto: CreateImageDto): Promise<{
        url: string;
        id: string;
        created_at: Date;
        alt_text: string | null;
        sort_order: number;
        product_id: string;
    }>;
    removeImage(imageId: string): Promise<void>;
}
