import { ReviewsService } from './reviews.service';
import type { Request } from 'express';
import { CreateReviewDto, UpdateReviewStatusDto } from './dto/reviews.dto';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    getProductReviews(productId: string, page: number, limit: number): Promise<import("../../common/utils/pagination.util").PaginatedResponse<any>>;
    createReview(req: Request, dto: CreateReviewDto): Promise<{
        message: string;
        data: {
            id: string;
            rating: number;
            comment: string | null;
            is_approved: boolean;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            product_id: string;
        };
    }>;
    getAllReviewsAdmin(page: number, limit: number): Promise<import("../../common/utils/pagination.util").PaginatedResponse<any>>;
    updateReviewStatus(id: string, dto: UpdateReviewStatusDto): Promise<{
        message: string;
        data: {
            id: string;
            rating: number;
            comment: string | null;
            is_approved: boolean;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            product_id: string;
        };
    }>;
    deleteReviewAdmin(id: string): Promise<{
        message: string;
    }>;
}
