"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("@prisma/client");
let InventoryService = class InventoryService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async incrementStock(variantId, amount) {
        if (amount <= 0)
            throw new common_1.BadRequestException('Amount must be positive');
        return this.prisma.inventory.update({
            where: { product_variant_id: variantId },
            data: {
                quantity: { increment: amount }
            }
        });
    }
    async decrementStock(variantId, amount) {
        if (amount <= 0)
            throw new common_1.BadRequestException('Amount must be positive');
        return this.prisma.$transaction(async (tx) => {
            const inventory = await tx.inventory.findUnique({
                where: { product_variant_id: variantId },
                select: { quantity: true, reserved_quantity: true, id: true }
            });
            if (!inventory)
                throw new common_1.BadRequestException('Inventory not found');
            const available = inventory.quantity - inventory.reserved_quantity;
            if (available < amount) {
                throw new common_1.BadRequestException('Insufficient stock available');
            }
            return tx.inventory.update({
                where: { id: inventory.id },
                data: { quantity: { decrement: amount } }
            });
        });
    }
    async reserveStock(variantId, amount) {
        return this.prisma.$transaction(async (tx) => {
            const inventory = await tx.inventory.findUnique({
                where: { product_variant_id: variantId },
                select: { quantity: true, reserved_quantity: true, id: true }
            });
            if (!inventory || (inventory.quantity - inventory.reserved_quantity < amount)) {
                throw new common_1.BadRequestException('Cannot reserve stock. Insufficient availability.');
            }
            return tx.inventory.update({
                where: { id: inventory.id },
                data: { reserved_quantity: { increment: amount } }
            });
        });
    }
    async releaseReservedStock(variantId, amount) {
        return this.prisma.inventory.update({
            where: { product_variant_id: variantId },
            data: { reserved_quantity: { decrement: amount } }
        });
    }
    async commitStock(variantId, amount) {
        return this.prisma.$transaction(async (tx) => {
            const inventory = await tx.inventory.findUnique({
                where: { product_variant_id: variantId }
            });
            if (!inventory || inventory.reserved_quantity < amount || inventory.quantity < amount) {
                throw new common_1.BadRequestException('Cannot commit stock. Data mismatch or insufficient reserved stock.');
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
    async getLowStockVariants(threshold = 5) {
        return this.prisma.$queryRaw `
      SELECT i.product_variant_id, i.quantity, i.reserved_quantity, (i.quantity - i.reserved_quantity) AS available_quantity, p.title as product_title, pv.sku
      FROM "Inventory" i
      JOIN "ProductVariant" pv ON i.product_variant_id = pv.id
      JOIN "Product" p ON pv.product_id = p.id
      WHERE (i.quantity - i.reserved_quantity) <= ${threshold}
      AND p.is_active = true
      AND p.deleted_at IS NULL
    `;
    }
    async getAllInventory(page = 1, limit = 10, search) {
        const skip = (page - 1) * limit;
        let searchCondition = client_1.Prisma.sql ``;
        if (search) {
            searchCondition = client_1.Prisma.sql `AND (p.title ILIKE ${'%' + search + '%'} OR pv.sku ILIKE ${'%' + search + '%'})`;
        }
        const data = await this.prisma.$queryRaw `
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
        const totalRes = await this.prisma.$queryRaw `
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
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map