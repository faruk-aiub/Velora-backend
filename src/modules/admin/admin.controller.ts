import {  ApiTags , ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PrismaService } from '../../database/prisma.service';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminAnalyticsController {

  constructor(private readonly prisma: PrismaService) {}

  @Get('dashboard')
  async getDashboard() {
    const totalOrders = await this.prisma.order.count();
    const totalCustomers = await this.prisma.user.count({ where: { role: 'CUSTOMER' } });
    const totalProducts = await this.prisma.product.count({ where: { is_active: true } });
    
    const orders = await this.prisma.order.findMany({
      select: { total_amount: true },
      where: { status: 'DELIVERED' }
    });
    const totalSales = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);

    const ordersList = await this.prisma.order.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: { user: { select: { email: true, profile: { select: { first_name: true, last_name: true } } } } }
    });

    const recentOrders = ordersList.map(order => ({
      id: order.order_number,
      customer: order.user?.profile ? `${order.user.profile.first_name} ${order.user.profile.last_name}` : order.user.email,
      date: order.created_at.toISOString().split('T')[0],
      total: `$${order.total_amount.toString()}`,
      status: order.status
    }));

    return { 
      success: true,
      data: { 
        totalSales, 
        totalOrders, 
        totalCustomers,
        totalProducts,
        recentOrders
      } 
    };
  }

  @Get('sales-report')
  async getSalesReport() {
    return { data: { daily: [], weekly: [], monthly: [] } };
  }

  @Get('user-stats')
  async getUserStats() {
    return { data: { total: 0, newThisMonth: 0 } };
  }
}
