import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Rule #11: INVENTORY SAFETY RULE
   * Stock update must be atomic to prevent overselling.
   */
  async incrementStock(variantId: string, amount: number) {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    return this.prisma.inventory.update({
      where: { product_variant_id: variantId },
      data: {
        quantity: { increment: amount } // Atomic increment
      }
    });
  }

  async decrementStock(variantId: string, amount: number) {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    // We use a transaction to ensure we don't drop below 0 if concurrent requests happen.
    // Although Prisma's `decrement` is atomic, PostgreSQL doesn't throw if it goes negative 
    // unless there's a CHECK constraint. We simulate a safe check here or rely on DB constraints.
    return this.prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({
        where: { product_variant_id: variantId },
        select: { quantity: true, reserved_quantity: true, id: true }
      });

      if (!inventory) throw new BadRequestException('Inventory not found');
      
      const available = inventory.quantity - inventory.reserved_quantity;
      if (available < amount) {
        throw new BadRequestException('Insufficient stock available');
      }

      return tx.inventory.update({
        where: { id: inventory.id },
        data: { quantity: { decrement: amount } }
      });
    });
  }

  async reserveStock(variantId: string, amount: number) {
    // Atomically move from available to reserved
    return this.prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({
        where: { product_variant_id: variantId },
        select: { quantity: true, reserved_quantity: true, id: true }
      });

      if (!inventory || (inventory.quantity - inventory.reserved_quantity < amount)) {
        throw new BadRequestException('Cannot reserve stock. Insufficient availability.');
      }

      return tx.inventory.update({
        where: { id: inventory.id },
        data: { reserved_quantity: { increment: amount } }
      });
    });
  }

  async releaseReservedStock(variantId: string, amount: number) {
    // Atomically release reserved stock
    return this.prisma.inventory.update({
      where: { product_variant_id: variantId },
      data: { reserved_quantity: { decrement: amount } }
    });
  }

  async commitStock(variantId: string, amount: number) {
    // Commit reserved stock after a successful payment
    // Deduct from both quantity and reserved_quantity
    return this.prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({
        where: { product_variant_id: variantId }
      });

      if (!inventory || inventory.reserved_quantity < amount || inventory.quantity < amount) {
        throw new BadRequestException('Cannot commit stock. Data mismatch or insufficient reserved stock.');
      }

      return tx.inventory.update({
        where: { id: inventory.id },
        data: {
          quantity: { decrement: amount },
          reserved_quantity: { decrement: amount }
        }
      });
    });
  }

  async getLowStockVariants(threshold: number = 5) {
    // Find all variants where available quantity is <= threshold
    // Using Prisma raw query or complex where logic is possible.
    // For simplicity, we fetch all where quantity - reserved <= threshold
    // In PostgreSQL, you could do a raw query, but with Prisma:
    // This fetches directly where `quantity` <= threshold + `reserved_quantity` is tricky in pure Prisma.
    // We will fetch where `quantity` <= threshold + (maybe not ideal for big data).
    // Let's use a raw query for efficiency.
    return this.prisma.$queryRaw`
      SELECT i.product_variant_id, i.quantity, i.reserved_quantity, (i.quantity - i.reserved_quantity) AS available_quantity, p.title as product_title, pv.sku
      FROM "Inventory" i
      JOIN "ProductVariant" pv ON i.product_variant_id = pv.id
      JOIN "Product" p ON pv.product_id = p.id
      WHERE (i.quantity - i.reserved_quantity) <= ${threshold}
      AND p.is_active = true
      AND p.deleted_at IS NULL
    `;
  }

  async getAllInventory(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    
    let searchCondition = Prisma.sql``;
    if (search) {
      searchCondition = Prisma.sql`AND (p.title ILIKE ${'%' + search + '%'} OR pv.sku ILIKE ${'%' + search + '%'})`;
    }

    const data = await this.prisma.$queryRaw`
      SELECT i.product_variant_id, i.quantity, i.reserved_quantity, (i.quantity - i.reserved_quantity) AS available_quantity, p.title as product_title, pv.sku
      FROM "Inventory" i
      JOIN "ProductVariant" pv ON i.product_variant_id = pv.id
      JOIN "Product" p ON pv.product_id = p.id
      WHERE p.is_active = true
      AND p.deleted_at IS NULL
      ${searchCondition}
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${skip}
    `;

    const totalRes: any = await this.prisma.$queryRaw`
      SELECT COUNT(*)::int as total
      FROM "Inventory" i
      JOIN "ProductVariant" pv ON i.product_variant_id = pv.id
      JOIN "Product" p ON pv.product_id = p.id
      WHERE p.is_active = true
      AND p.deleted_at IS NULL
      ${searchCondition}
    `;

    return {
      data,
      total: totalRes[0]?.total || 0,
      page,
      limit,
    };
  }
}
