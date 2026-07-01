import {  ApiTags , ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import type { Request } from 'express';
import { CreateReviewDto, UpdateReviewStatusDto } from './dto/reviews.dto';

@ApiTags('Reviews')
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiBearerAuth()
  @Get('reviews/me')
  @UseGuards(JwtAuthGuard)
  async getMyReviews(@Req() req: Request, @Query('page') page: number, @Query('limit') limit: number) {
    const userId = (req as any).user.sub;
    return this.reviewsService.getMyReviews(userId, page, limit);
  }

  @ApiBearerAuth()
  @Get('products/:productId/reviews')
  async getProductReviews(
    @Param('productId') productId: string,
    @Query('page') page: number,
    @Query('limit') limit: number
  ) {
    return this.reviewsService.getProductReviews(productId, page, limit);
  }

  @ApiBearerAuth()
  @Post('reviews')
  @UseGuards(JwtAuthGuard)
  async createReview(@Req() req: Request, @Body() dto: CreateReviewDto) {
    const userId = (req as any).user.sub;
    const review = await this.reviewsService.createReview(userId, dto);
    return { message: 'Review submitted successfully', data: review };
  }

  // --- ADMIN APIs ---

  @ApiBearerAuth()
  @Get('admin/reviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAllReviewsAdmin(@Query('page') page: number, @Query('limit') limit: number) {
    return this.reviewsService.findAllAdmin(page, limit);
  }

  @ApiBearerAuth()
  @Put('admin/reviews/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateReviewStatus(@Param('id') id: string, @Body() dto: UpdateReviewStatusDto) {
    const review = await this.reviewsService.updateStatus(id, dto.is_approved);
    return { message: 'Review status updated', data: review };
  }

  @ApiBearerAuth()
  @Delete('admin/reviews/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteReviewAdmin(@Param('id') id: string) {
    await this.reviewsService.deleteReview(id);
    return { message: 'Review deleted successfully' };
  }
}
