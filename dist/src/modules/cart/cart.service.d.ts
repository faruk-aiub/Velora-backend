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
                    slug: string;
                    title: string;
                    images: {
                        url: string;
                    }[];
                };
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
        } & {
            id: string;
            created_at: Date;
            quantity: number;
            variant_id: string;
            cart_id: string;
        })[];
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
    }>;
    addItem(userId: string, dto: AddToCartDto): Promise<{
        id: string;
        created_at: Date;
        quantity: number;
        variant_id: string;
        cart_id: string;
    }>;
    updateItemQuantity(userId: string, itemId: string, dto: UpdateCartItemDto): Promise<{
        id: string;
        created_at: Date;
        quantity: number;
        variant_id: string;
        cart_id: string;
    }>;
    removeItem(userId: string, itemId: string): Promise<boolean>;
    clearCart(userId: string): Promise<true | undefined>;
}
