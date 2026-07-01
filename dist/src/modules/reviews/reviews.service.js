"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const pagination_util_1 = require("../../common/utils/pagination.util");
let ReviewsService = class ReviewsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createReview(userId, dto) {
        const product = await this.prisma.product.findUnique({ where: { id: dto.product_id } });
        if (!product || product.deleted_at)
            throw new common_1.NotFoundException('Product not found');
        const verifiedPurchase = await this.prisma.orderItem.findFirst({
            where: {
                order: {
                    user_id: userId,
                    status: 'DELIVERED'
                },
                variant: {
                    product_id: dto.product_id
                }
            }
        });
        if (!verifiedPurchase) {
            throw new common_1.BadRequestException('You can only review products you have purchased and received.');
        }
        const existingReview = await this.prisma.review.findFirst({
            where: { user_id: userId, product_id: dto.product_id }
        });
        if (existingReview) {
            throw new common_1.BadRequestException('You have already reviewed this product.');
        }
        return this.prisma.review.create({
            data: {
                user_id: userId,
                product_id: dto.product_id,
                rating: dto.rating,
                comment: dto.comment,
                is_approved: true
            }
        });
    }
    async getProductReviews(productId, page, limit) {
        const { skip, take, page: currentPage, limit: currentLimit } = (0, pagination_util_1.getPaginationParams)(page, limit);
        const [reviews, total] = await this.prisma.$transaction([
            this.prisma.review.findMany({
                where: { product_id: productId, is_approved: true },
                skip,
                take,
                orderBy: { created_at: 'desc' },
                include: { user: { select: { profile: { select: { first_name: true, last_name: true } } } } }
            }),
            this.prisma.review.count({ where: { product_id: productId, is_approved: true } })
        ]);
        const aggregate = await this.prisma.review.aggregate({
            where: { product_id: productId, is_approved: true },
            _avg: { rating: true },
            _count: { rating: true }
        });
        const paginated = (0, pagination_util_1.createPaginationResponse)(reviews, total, currentPage, currentLimit);
        return {
            ...paginated,
            meta: {
                ...paginated.meta,
                average_rating: aggregate._avg.rating || 0,
                total_reviews: aggregate._count.rating || 0
            }
        };
    }
    async getMyReviews(userId, page, limit) {
        const { skip, take, page: currentPage, limit: currentLimit } = (0, pagination_util_1.getPaginationParams)(page, limit);
        const [reviews, total] = await this.prisma.$transaction([
            this.prisma.review.findMany({
                where: { user_id: userId },
                skip,
                take,
                orderBy: { created_at: 'desc' },
                include: { product: { select: { title: true, slug: true, images: { take: 1, select: { url: true } } } } }
            }),
            this.prisma.review.count({ where: { user_id: userId } })
        ]);
        return (0, pagination_util_1.createPaginationResponse)(reviews, total, currentPage, currentLimit);
    }
    async findAllAdmin(page, limit) {
        const { skip, take, page: currentPage, limit: currentLimit } = (0, pagination_util_1.getPaginationParams)(page, limit);
        const [reviews, total] = await this.prisma.$transaction([
            this.prisma.review.findMany({
                skip,
                take,
                orderBy: { created_at: 'desc' },
                include: {
                    user: { select: { email: true } },
                    product: { select: { title: true } }
                }
            }),
            this.prisma.review.count()
        ]);
        return (0, pagination_util_1.createPaginationResponse)(reviews, total, currentPage, currentLimit);
    }
    async updateStatus(id, is_approved) {
        const review = await this.prisma.review.findUnique({ where: { id } });
        if (!review)
            throw new common_1.NotFoundException('Review not found');
        return this.prisma.review.update({
            where: { id },
            data: { is_approved }
        });
    }
    async deleteReview(id) {
        const review = await this.prisma.review.findUnique({ where: { id } });
        if (!review)
            throw new common_1.NotFoundException('Review not found');
        await this.prisma.review.delete({ where: { id } });
        return true;
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map