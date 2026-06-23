import { PrismaService } from '../../database/prisma.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
export declare class CartService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getCart(userId: string): Promise<{
        total_amount: number;
        items: ({
            variant: {
                product: {
                    title: string;
                    slug: string;
                    images: {
                        url: string;
                    }[];
                };
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
        } & {
            variant_id: string;
            quantity: number;
            id: string;
            created_at: Date;
            cart_id: string;
        })[];
        id: string;
        user_id: string;
        created_at: Date;
        updated_at: Date;
    }>;
    addItem(userId: string, dto: AddToCartDto): Promise<{
        variant_id: string;
        quantity: number;
        id: string;
        created_at: Date;
        cart_id: string;
    }>;
    updateItemQuantity(userId: string, itemId: string, dto: UpdateCartItemDto): Promise<{
        variant_id: string;
        quantity: number;
        id: string;
        created_at: Date;
        cart_id: string;
    }>;
    removeItem(userId: string, itemId: string): Promise<boolean>;
    clearCart(userId: string): Promise<true | undefined>;
}
