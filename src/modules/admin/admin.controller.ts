import {  ApiTags , ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminAnalyticsController {

  @Get('dashboard')
  async getDashboard() {
    return { data: { totalRevenue: 0, totalOrders: 0, activeUsers: 0 } };
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
