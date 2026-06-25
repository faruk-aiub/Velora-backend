import { WishlistService } from './wishlist.service';
export declare class WishlistController {
    private readonly wishlistService;
    constructor(wishlistService: WishlistService);
    getWishlist(req: any): Promise<{
        data: ({
            product: {
                id: string;
                slug: string;
                title: string;
                variants: {
                    price: import("@prisma/client-runtime-utils").Decimal;
                    compare_price: import("@prisma/client-runtime-utils").Decimal | null;
                }[];
                images: {
                    url: string;
                }[];
            };
        } & {
            id: string;
            created_at: Date;
            user_id: string;
            product_id: string;
        })[];
    }>;
    toggleWishlistItem(req: any, productId: string): Promise<{
        message: string;
        status: string;
    }>;
}
