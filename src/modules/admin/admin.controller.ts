import {  ApiTags , ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
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
    
    const orders = await this.prisma.order.aggregate({
      _sum: { total_amount: true },
      where: { status: 'DELIVERED' }
    });
    const totalSales = Number(orders._sum.total_amount || 0);

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
    // Group orders by month using raw query or manual JS aggregation.
    // Given Prisma's limitations with grouping by month dynamically across databases, we fetch this year's delivered orders and bucket them.
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    
    const orders = await this.prisma.order.findMany({
      where: { 
        status: 'DELIVERED',
        created_at: { gte: startOfYear }
      },
      select: { total_amount: true, created_at: true }
    });

    const monthlySales = Array(12).fill(0);

    orders.forEach(order => {
      const orderDate = new Date(order.created_at);
      if (orderDate.getFullYear() === currentYear) {
        monthlySales[orderDate.getMonth()] += Number(order.total_amount);
      }
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthly = monthlySales.map((total, index) => ({
      name: months[index],
      total: total
    }));

    return { data: { monthly } };
  }

  @Get('user-stats')
  async getUserStats() {
    const total = await this.prisma.user.count({ where: { role: 'CUSTOMER' } });
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newThisMonth = await this.prisma.user.count({
      where: { 
        role: 'CUSTOMER',
        created_at: { gte: thirtyDaysAgo }
      }
    });

    return { data: { total, newThisMonth } };
  }

  @Get('admins')
  async getAdmins() {
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        role: true,
        is_active: true,
        created_at: true,
        profile: true
      }
    });
    return { data: admins };
  }

  @Post('admins')
  async createAdmin(@Body() dto: any) {
    // In a real app, use proper DTO validation here
    // Also requires bcrypt for password hashing
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    
    const admin = await this.prisma.user.create({
      data: {
        email: dto.email,
        password_hash: hashedPassword,
        role: 'ADMIN',
        profile: {
          create: {
            first_name: dto.first_name,
            last_name: dto.last_name
          }
        }
      },
      select: { id: true, email: true, role: true }
    });
    
    return { message: 'Admin created successfully', data: admin };
  }
}
