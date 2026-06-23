import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { InitiatePaymentDto, VerifyPaymentDto, PaymentProviderEnum, PaymentStatusEnum } from './dto/payments.dto';
import { InventoryService } from '../inventory/inventory.service';
import { getPaginationParams, createPaginationResponse, PaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService
  ) {}

  async initiatePayment(userId: string, dto: InitiatePaymentDto) {
    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });

    if (!order) throw new NotFoundException('Order not found');
    if (order.user_id !== userId) throw new BadRequestException('Unauthorized order access');
    if (order.status !== 'PENDING') throw new BadRequestException('Order is no longer pending');

    // Check if there is already a pending payment
    const existingPayment = await this.prisma.payment.findFirst({
      where: { order_id: order.id, status: 'PENDING' }
    });

    if (existingPayment) {
      return { 
        paymentId: existingPayment.id, 
        paymentUrl: `https://mock-\${dto.provider.toLowerCase()}-gateway.com/pay/\${existingPayment.id}` 
      };
    }

    const payment = await this.prisma.payment.create({
      data: {
        order_id: order.id,
        provider: dto.provider,
        amount: order.total_amount,
        status: 'PENDING'
      }
    });

    // If COD, we can immediately process it as success (or keep pending depending on business logic).
    // The plan requested COD to be left as PENDING but order marked as PROCESSING.
    if (dto.provider === 'COD') {
      await this.prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'PROCESSING',
          status_history: { create: { status: 'PROCESSING', notes: 'COD Selected' } }
        }
      });
      return { paymentId: payment.id, message: 'COD Order placed successfully' };
    }

    return { 
      paymentId: payment.id, 
      paymentUrl: `https://mock-\${dto.provider.toLowerCase()}-gateway.com/pay/\${payment.id}` 
    };
  }

  async verifyPayment(dto: VerifyPaymentDto) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: dto.paymentId },
      include: { order: { include: { items: true } } }
    });

    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status !== 'PENDING') throw new BadRequestException('Payment already processed');

    return this.prisma.$transaction(async (tx) => {
      // 1. Update Payment Status
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: dto.status,
          transaction_id: dto.transactionId,
          gateway_response: { verified_at: new Date().toISOString() }
        }
      });

      // 2. Process Order and Inventory if SUCCESS
      if (dto.status === 'SUCCESS') {
        // Update Order to CONFIRMED or PROCESSING
        await tx.order.update({
          where: { id: payment.order_id },
          data: {
            status: 'CONFIRMED',
            status_history: { create: { status: 'CONFIRMED', notes: 'Payment successful' } }
          }
        });

        // CRITICAL: Commit Stock
        // For each item, we need to call commitStock. Since InventoryService uses its own transactions, 
        // we might run into nested transaction issues if InventoryService uses Prisma.$transaction internally.
        // Instead of calling the service method which has its own tx, we will implement the logic here inside the current tx to ensure full atomicity.
        for (const item of payment.order.items) {
          const inventory = await tx.inventory.findUnique({ where: { product_variant_id: item.variant_id } });
          if (!inventory || inventory.reserved_quantity < item.quantity || inventory.quantity < item.quantity) {
             throw new BadRequestException('Critical inventory mismatch during payment verification');
          }

          await tx.inventory.update({
            where: { id: inventory.id },
            data: {
              quantity: { decrement: item.quantity },
              reserved_quantity: { decrement: item.quantity }
            }
          });
        }
      } else if (dto.status === 'FAILED') {
         await tx.order.update({
          where: { id: payment.order_id },
          data: {
            status_history: { create: { status: 'PENDING', notes: 'Payment failed' } }
          }
        });
      }

      return updatedPayment;
    });
  }

  async getPaymentDetails(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.user_id !== userId) throw new NotFoundException('Order not found');

    const payments = await this.prisma.payment.findMany({
      where: { order_id: orderId },
      orderBy: { created_at: 'desc' }
    });

    return payments;
  }

  async findAllAdmin(page?: number, limit?: number): Promise<PaginatedResponse<any>> {
    const { skip, take, page: currentPage, limit: currentLimit } = getPaginationParams(page, limit);

    const [payments, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        skip,
        take,
        orderBy: { created_at: 'desc' },
        include: { order: { select: { order_number: true } } }
      }),
      this.prisma.payment.count()
    ]);

    return createPaginationResponse(payments, total, currentPage, currentLimit);
  }
}
