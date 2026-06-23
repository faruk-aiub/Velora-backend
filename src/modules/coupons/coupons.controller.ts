import {  ApiTags , ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateCouponDto, ValidateCouponDto } from './dto/coupons.dto';

@ApiTags('Coupons')
@Controller()
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @ApiBearerAuth()
  @Post('coupons/validate')
  @UseGuards(JwtAuthGuard)
  async validateCoupon(@Body() dto: ValidateCouponDto) {
    const result = await this.couponsService.validateAndCalculate(dto);
    return { message: 'Coupon applied successfully', data: result };
  }

  // --- ADMIN APIs ---

  @ApiBearerAuth()
  @Post('admin/coupons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createCoupon(@Body() dto: CreateCouponDto) {
    const coupon = await this.couponsService.create(dto);
    return { message: 'Coupon created successfully', data: coupon };
  }

  @ApiBearerAuth()
  @Get('admin/coupons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAllCouponsAdmin(@Query('page') page: number, @Query('limit') limit: number) {
    return this.couponsService.findAll(page, limit);
  }

  @ApiBearerAuth()
  @Delete('admin/coupons/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteCoupon(@Param('id') id: string) {
    await this.couponsService.delete(id);
    return { message: 'Coupon deleted successfully' };
  }
}
