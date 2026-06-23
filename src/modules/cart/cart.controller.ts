import {  ApiTags , ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Request() req: any) {
    const data = await this.cartService.getCart(req.user.sub);
    return { data };
  }

  @Post('items')
  async addItem(@Request() req: any, @Body() dto: AddToCartDto) {
    const item = await this.cartService.addItem(req.user.sub, dto);
    return { message: 'Item added to cart', data: item };
  }

  @Put('items/:itemId')
  async updateItemQuantity(@Request() req: any, @Param('itemId') itemId: string, @Body() dto: UpdateCartItemDto) {
    const item = await this.cartService.updateItemQuantity(req.user.sub, itemId, dto);
    return { message: 'Item quantity updated', data: item };
  }

  @Delete('items/:itemId')
  async removeItem(@Request() req: any, @Param('itemId') itemId: string) {
    await this.cartService.removeItem(req.user.sub, itemId);
    return { message: 'Item removed from cart' };
  }

  @Delete()
  async clearCart(@Request() req: any) {
    await this.cartService.clearCart(req.user.sub);
    return { message: 'Cart cleared' };
  }
}
