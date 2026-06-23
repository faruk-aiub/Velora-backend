import {  ApiTags , ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Wishlist')
@ApiBearerAuth()
@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  async getWishlist(@Request() req: any) {
    const data = await this.wishlistService.getWishlist(req.user.sub);
    return { data };
  }

  @Post(':productId/toggle')
  async toggleWishlistItem(@Request() req: any, @Param('productId') productId: string) {
    const result = await this.wishlistService.toggleWishlistItem(req.user.sub, productId);
    return result;
  }
}
