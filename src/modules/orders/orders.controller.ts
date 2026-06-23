import {  ApiTags , ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import type { Request } from 'express';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/orders.dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('orders/create')
  @UseGuards(JwtAuthGuard)
  async createOrder(@Req() req: Request, @Body() body: CreateOrderDto) {
    const userId = (req as any).user.sub;
    const order = await this.ordersService.createOrder(userId, body.shippingAddressId, body.cartItems);
    return { message: 'Order created successfully', data: order };
  }

  @Get('orders')
  @UseGuards(JwtAuthGuard)
  async getUserOrders(@Req() req: Request, @Query('page') page: number, @Query('limit') limit: number) {
    const userId = (req as any).user.sub;
    return this.ordersService.findAll(userId, page, limit);
  }

  @Get('orders/:id')
  @UseGuards(JwtAuthGuard)
  async getOrderDetails(@Req() req: Request, @Param('id') id: string) {
    const userId = (req as any).user.sub;
    const order = await this.ordersService.findOne(id, userId);
    return { data: order };
  }

  @Get('orders/track/:orderNumber')
  async trackOrder(@Param('orderNumber') orderNumber: string) {
    const data = await this.ordersService.trackByNumber(orderNumber);
    return { data };
  }

  // --- ADMIN ROUTES ---

  @Get('admin/orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAllOrdersAdmin(@Query('page') page: number, @Query('limit') limit: number) {
    return this.ordersService.findAllAdmin(page, limit);
  }

  @Put('admin/orders/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateOrderStatus(@Param('id') id: string, @Body() body: UpdateOrderStatusDto) {
    const updated = await this.ordersService.updateStatus(id, body.status);
    return { message: `Order status updated to \${body.status}`, data: updated };
  }
}
