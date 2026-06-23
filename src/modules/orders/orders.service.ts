import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { getPaginationParams, createPaginationResponse, PaginatedResponse } from '../../common/utils/pagination.util';
import { OrderStatusEnum } from './dto/orders.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, page?: number, limit?: number): Promise<PaginatedResponse<any>> {
    const { skip, take, page: currentPage, limit: currentLimit } = getPaginationParams(page, limit);

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where: { user_id: userId },
        skip,
        take,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          order_number: true,
          total_amount: true,
          status: true,
          created_at: true,
        }
      }),
      this.prisma.order.count({ where: { user_id: userId } })
    ]);

    return createPaginationResponse(orders, total, currentPage, currentLimit);
  }

  async findOne(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, user_id: userId },
      select: {
        id: true,
        order_number: true,
        total_amount: true,
        status: true,
        created_at: true,
        shipping_address: {
          select: { address_line1: true, city: true, postal_code: true }
        },
        items: {
          select: {
            id: true,
            quantity: true,
            price: true,
            product_name: true,
            sku: true,
            image_url: true
          }
        },
        payments: {
          select: { provider: true, status: true, amount: true, transaction_id: true }
        },
        status_history: {
          select: { status: true, notes: true, created_at: true },
          orderBy: { created_at: 'desc' }
        }
      }
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async createOrder(userId: string, shippingAddressId: string, cartItems: { variantId: string, quantity: number }[]) {
    // Validate shipping address belongs to user
    const address = await this.prisma.userAddress.findUnique({ where: { id: shippingAddressId } });
    if (!address || address.user_id !== userId) {
      throw new BadRequestException('Invalid shipping address');
    }

    if (!cartItems || cartItems.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Interactive transaction
    return this.prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsToCreate: any[] = [];

      for (const item of cartItems) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          select: {
            id: true,
            sku: true,
            price: true,
            compare_price: true,
            product: { select: { title: true, images: { take: 1, select: { url: true } } } },
            inventory: { select: { id: true, quantity: true, reserved_quantity: true } }
          }
        });

        if (!variant || !variant.inventory) {
          throw new BadRequestException(`Variant ${item.variantId} is invalid.`);
        }

        const available = variant.inventory.quantity - variant.inventory.reserved_quantity;
        if (available < item.quantity) {
          throw new BadRequestException(`Not enough stock for ${variant.product.title}`);
        }

        // Rule #11: Atomic inventory reservation (we add to reserved_quantity)
        await tx.inventory.update({
          where: { id: variant.inventory.id },
          data: {
            reserved_quantity: { increment: item.quantity }
          }
        });

        const activePrice = Number(variant.compare_price || variant.price);
        const itemTotal = activePrice * item.quantity;
        totalAmount += itemTotal;

        orderItemsToCreate.push({
          variant_id: variant.id,
          quantity: item.quantity,
          price: activePrice,
          product_name: variant.product.title,
          sku: variant.sku,
          image_url: variant.product.images[0]?.url || null,
        });
      }

      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const order = await tx.order.create({
        data: {
          user_id: userId,
          shipping_address_id: shippingAddressId,
          order_number: orderNumber,
          total_amount: totalAmount,
          status: 'PENDING',
          items: {
            create: orderItemsToCreate
          },
          status_history: {
            create: [{ status: 'PENDING', notes: 'Order placed' }]
          }
        },
        select: { id: true, order_number: true, total_amount: true, status: true }
      });

      await tx.cart.deleteMany({ where: { user_id: userId } });

      return order;
    });
  }

  async trackByNumber(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { order_number: orderNumber },
      select: {
        order_number: true,
        status: true,
        created_at: true,
        status_history: {
          select: { status: true, created_at: true, notes: true },
          orderBy: { created_at: 'desc' }
        }
      }
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  // --- ADMIN METHODS ---

  async findAllAdmin(page?: number, limit?: number): Promise<PaginatedResponse<any>> {
    const { skip, take, page: currentPage, limit: currentLimit } = getPaginationParams(page, limit);

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        skip,
        take,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          order_number: true,
          total_amount: true,
          status: true,
          created_at: true,
          user: { select: { id: true, email: true } }
        }
      }),
      this.prisma.order.count()
    ]);

    return createPaginationResponse(orders, total, currentPage, currentLimit);
  }

  async updateStatus(orderId: string, status: OrderStatusEnum, notes?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) throw new NotFoundException('Order not found');

    return this.prisma.$transaction(async (tx) => {
      // If cancelling or returning, refund reserved stock
      if (['CANCELLED', 'RETURNED'].includes(status) && !['CANCELLED', 'RETURNED'].includes(order.status)) {
        for (const item of order.items) {
          const inventory = await tx.inventory.findUnique({ where: { product_variant_id: item.variant_id } });
          if (inventory) {
            // Note: Since we only reserved stock on creation, cancelling releases reserved_quantity.
            // If the order was fully paid and committed, we might need a different logic to refund actual quantity.
            // Assuming for this scope, we just release reserved.
            await tx.inventory.update({
              where: { id: inventory.id },
              data: { reserved_quantity: { decrement: item.quantity } }
            });
          }
        }
      }

      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status,
          status_history: {
            create: { status, notes: notes || `Status updated to \${status}` }
          }
        }
      });

      return updated;
    });
  }
}
