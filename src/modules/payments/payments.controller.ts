import {  ApiTags , ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import type { Request } from 'express';
import { InitiatePaymentDto, VerifyPaymentDto } from './dto/payments.dto';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiBearerAuth()
  @Post('payments/initiate')
  @UseGuards(JwtAuthGuard)
  async initiatePayment(@Body() dto: InitiatePaymentDto, @Req() req: Request) {
    const userId = (req as any).user.sub;
    const result = await this.paymentsService.initiatePayment(userId, dto);
    return { message: 'Payment initiated', data: result };
  }

  @Post('payments/verify')
  async verifyPayment(@Body() dto: VerifyPaymentDto) {
    // In a real world scenario, this would be a webhook endpoint without JWT guard,
    // relying on a gateway signature for verification.
    const result = await this.paymentsService.verifyPayment(dto);
    return { message: 'Payment verified', data: result };
  }

  @ApiBearerAuth()
  @Get('payments/:orderId')
  @UseGuards(JwtAuthGuard)
  async getPaymentDetails(@Param('orderId') orderId: string, @Req() req: Request) {
    const userId = (req as any).user.sub;
    const data = await this.paymentsService.getPaymentDetails(orderId, userId);
    return { data };
  }

  // --- ADMIN APIs ---

  @ApiBearerAuth()
  @Get('admin/payments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAllPaymentsAdmin(@Query('page') page: number, @Query('limit') limit: number) {
    return this.paymentsService.findAllAdmin(page, limit);
  }
}
