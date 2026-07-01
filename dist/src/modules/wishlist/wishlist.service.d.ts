import { PrismaService } from '../../database/prisma.service';
export declare class WishlistService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getWishlist(userId: string): Promise<({
        product: {
            id: string;
            title: string;
            slug: string;
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
    })[]>;
    toggleWishlistItem(userId: string, productId: string): Promise<{
        message: string;
        status: string;
    }>;
}
