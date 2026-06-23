import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { PaginatedResponse } from '../../common/utils/pagination.util';
import { CreateProductDto, UpdateProductDto, CreateVariantDto, UpdateVariantDto, CreateImageDto } from './dto/products.dto';
export declare class ProductsService {
    private readonly prisma;
    private readonly redis;
    constructor(prisma: PrismaService, redis: RedisService);
    private invalidateProductCaches;
    findAll(page?: number, limit?: number, categoryId?: string, brandId?: string, minPrice?: number, maxPrice?: number): Promise<PaginatedResponse<any>>;
    findOneBySlug(slug: string): Promise<{
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
    }>;
    create(dto: CreateProductDto): Promise<{
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
    }>;
    update(id: string, dto: UpdateProductDto): Promise<{
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
    }>;
    delete(id: string): Promise<boolean>;
    addVariant(productId: string, dto: CreateVariantDto): Promise<{
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
    }>;
    updateVariant(variantId: string, dto: UpdateVariantDto): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        product_id: string;
        sku: string;
        price: import("@prisma/client-runtime-utils").Decimal;
        compare_price: import("@prisma/client-runtime-utils").Decimal | null;
        attributes: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    removeVariant(variantId: string): Promise<void>;
    addImage(productId: string, dto: CreateImageDto): Promise<{
        id: string;
        created_at: Date;
        product_id: string;
        url: string;
        alt_text: string | null;
        sort_order: number;
    }>;
    removeImage(imageId: string): Promise<void>;
}
