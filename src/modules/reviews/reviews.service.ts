import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateReviewDto } from './dto/reviews.dto';
import { getPaginationParams, createPaginationResponse, PaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(userId: string, dto: CreateReviewDto) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.product_id } });
    if (!product || product.deleted_at) throw new NotFoundException('Product not found');

    // VERIFIED PURCHASE CHECK: User must have an order with status DELIVERED containing this product
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
      throw new BadRequestException('You can only review products you have purchased and received.');
    }

    // Check if user already reviewed this product
    const existingReview = await this.prisma.review.findFirst({
      where: { user_id: userId, product_id: dto.product_id }
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this product.');
    }

    return this.prisma.review.create({
      data: {
        user_id: userId,
        product_id: dto.product_id,
        rating: dto.rating,
        comment: dto.comment,
        is_approved: false // Requires admin approval by default
      }
    });
  }

  async getProductReviews(productId: string, page?: number, limit?: number): Promise<PaginatedResponse<any>> {
    const { skip, take, page: currentPage, limit: currentLimit } = getPaginationParams(page, limit);

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

    // Calculate dynamic average rating
    const aggregate = await this.prisma.review.aggregate({
      where: { product_id: productId, is_approved: true },
      _avg: { rating: true },
      _count: { rating: true }
    });

    const paginated = createPaginationResponse(reviews, total, currentPage, currentLimit);
    
    return {
      ...paginated,
      meta: {
        ...paginated.meta,
        average_rating: aggregate._avg.rating || 0,
        total_reviews: aggregate._count.rating || 0
      }
    };
  }

  // --- ADMIN METHODS ---

  async findAllAdmin(page?: number, limit?: number): Promise<PaginatedResponse<any>> {
    const { skip, take, page: currentPage, limit: currentLimit } = getPaginationParams(page, limit);

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

    return createPaginationResponse(reviews, total, currentPage, currentLimit);
  }

  async updateStatus(id: string, is_approved: boolean) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');

    return this.prisma.review.update({
      where: { id },
      data: { is_approved }
    });
  }

  async deleteReview(id: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');

    await this.prisma.review.delete({ where: { id } });
    return true;
  }
}
