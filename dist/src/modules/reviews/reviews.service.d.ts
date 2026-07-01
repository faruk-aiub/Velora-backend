import { PrismaService } from '../../database/prisma.service';
import { CreateReviewDto } from './dto/reviews.dto';
import { PaginatedResponse } from '../../common/utils/pagination.util';
export declare class ReviewsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createReview(userId: string, dto: CreateReviewDto): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        product_id: string;
        rating: number;
        comment: string | null;
        is_approved: boolean;
    }>;
    getProductReviews(productId: string, page?: number, limit?: number): Promise<PaginatedResponse<any>>;
    getMyReviews(userId: string, page?: number, limit?: number): Promise<PaginatedResponse<any>>;
    findAllAdmin(page?: number, limit?: number): Promise<PaginatedResponse<any>>;
    updateStatus(id: string, is_approved: boolean): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        product_id: string;
        rating: number;
        comment: string | null;
        is_approved: boolean;
    }>;
    deleteReview(id: string): Promise<boolean>;
}
