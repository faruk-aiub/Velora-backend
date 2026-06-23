import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    getCart(req: any): Promise<{
        data: {
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
        };
    }>;
    addItem(req: any, dto: AddToCartDto): Promise<{
        message: string;
        data: {
            variant_id: string;
            quantity: number;
            id: string;
            created_at: Date;
            cart_id: string;
        };
    }>;
    updateItemQuantity(req: any, itemId: string, dto: UpdateCartItemDto): Promise<{
        message: string;
        data: {
            variant_id: string;
            quantity: number;
            id: string;
            created_at: Date;
            cart_id: string;
        };
    }>;
    removeItem(req: any, itemId: string): Promise<{
        message: string;
    }>;
    clearCart(req: any): Promise<{
        message: string;
    }>;
}
