import {  ApiTags , ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Param, Query, UseGuards, Req, Res, Headers } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
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
    // Legacy / manual verification endpoint
    const result = await this.paymentsService.verifyPayment(dto);
    return { message: 'Payment verified', data: result };
  }

  @Post('payments/webhook')
  async stripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!signature || !req.rawBody) {
      return { received: false, message: 'Missing signature or rawBody' };
    }
    
    return this.paymentsService.handleStripeWebhook(signature, req.rawBody);
  }

  @Get('payments/mock-gateway/:id')
  mockGatewayPage(@Param('id') paymentId: string, @Res() res: any) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Mock Payment Gateway</title>
        <style>
          body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f4f4f9; }
          .container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
          button { padding: 10px 20px; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; margin: 10px; color: white; }
          .btn-success { background: #28a745; }
          .btn-fail { background: #dc3545; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Mock Payment Gateway</h2>
          <p>Payment ID: <strong>${paymentId}</strong></p>
          <p>Simulate the outcome of this payment:</p>
          <button class="btn-success" onclick="verify('SUCCESS')">Simulate Success</button>
          <button class="btn-fail" onclick="verify('FAILED')">Simulate Failure</button>
        </div>
        <script>
          async function verify(status) {
            const res = await fetch('/api/v1/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentId: '${paymentId}',
                status: status,
                transactionId: 'txn_' + Date.now()
              })
            });
            if(res.ok) {
              alert('Payment ' + status + '! You can close this or redirect to frontend.');
              // Redirect to frontend (adjust port based on env)
              window.location.href = 'http://localhost:3001/checkout/success';
            } else {
              alert('Verification failed');
            }
          }
        </script>
      </body>
      </html>
    `;
    res.type('html').send(html);
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
