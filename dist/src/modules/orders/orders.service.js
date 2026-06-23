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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const pagination_util_1 = require("../../common/utils/pagination.util");
let OrdersService = class OrdersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId, page, limit) {
        const { skip, take, page: currentPage, limit: currentLimit } = (0, pagination_util_1.getPaginationParams)(page, limit);
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
        return (0, pagination_util_1.createPaginationResponse)(orders, total, currentPage, currentLimit);
    }
    async findOne(orderId, userId) {
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
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return order;
    }
    async createOrder(userId, shippingAddressId, cartItems) {
        const address = await this.prisma.userAddress.findUnique({ where: { id: shippingAddressId } });
        if (!address || address.user_id !== userId) {
            throw new common_1.BadRequestException('Invalid shipping address');
        }
        if (!cartItems || cartItems.length === 0) {
            throw new common_1.BadRequestException('Cart is empty');
        }
        return this.prisma.$transaction(async (tx) => {
            let totalAmount = 0;
            const orderItemsToCreate = [];
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
                    throw new common_1.BadRequestException(`Variant ${item.variantId} is invalid.`);
                }
                const available = variant.inventory.quantity - variant.inventory.reserved_quantity;
                if (available < item.quantity) {
                    throw new common_1.BadRequestException(`Not enough stock for ${variant.product.title}`);
                }
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
    async trackByNumber(orderNumber) {
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
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return order;
    }
    async findAllAdmin(page, limit) {
        const { skip, take, page: currentPage, limit: currentLimit } = (0, pagination_util_1.getPaginationParams)(page, limit);
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
        return (0, pagination_util_1.createPaginationResponse)(orders, total, currentPage, currentLimit);
    }
    async updateStatus(orderId, status, notes) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true }
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return this.prisma.$transaction(async (tx) => {
            if (['CANCELLED', 'RETURNED'].includes(status) && !['CANCELLED', 'RETURNED'].includes(order.status)) {
                for (const item of order.items) {
                    const inventory = await tx.inventory.findUnique({ where: { product_variant_id: item.variant_id } });
                    if (inventory) {
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
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map