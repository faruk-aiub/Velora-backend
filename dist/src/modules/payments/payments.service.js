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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const inventory_service_1 = require("../inventory/inventory.service");
const pagination_util_1 = require("../../common/utils/pagination.util");
let PaymentsService = class PaymentsService {
    prisma;
    inventoryService;
    constructor(prisma, inventoryService) {
        this.prisma = prisma;
        this.inventoryService = inventoryService;
    }
    async initiatePayment(userId, dto) {
        const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.user_id !== userId)
            throw new common_1.BadRequestException('Unauthorized order access');
        if (order.status !== 'PENDING')
            throw new common_1.BadRequestException('Order is no longer pending');
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
    async verifyPayment(dto) {
        const payment = await this.prisma.payment.findUnique({
            where: { id: dto.paymentId },
            include: { order: { include: { items: true } } }
        });
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        if (payment.status !== 'PENDING')
            throw new common_1.BadRequestException('Payment already processed');
        return this.prisma.$transaction(async (tx) => {
            const updatedPayment = await tx.payment.update({
                where: { id: payment.id },
                data: {
                    status: dto.status,
                    transaction_id: dto.transactionId,
                    gateway_response: { verified_at: new Date().toISOString() }
                }
            });
            if (dto.status === 'SUCCESS') {
                await tx.order.update({
                    where: { id: payment.order_id },
                    data: {
                        status: 'CONFIRMED',
                        status_history: { create: { status: 'CONFIRMED', notes: 'Payment successful' } }
                    }
                });
                for (const item of payment.order.items) {
                    const inventory = await tx.inventory.findUnique({ where: { product_variant_id: item.variant_id } });
                    if (!inventory || inventory.reserved_quantity < item.quantity || inventory.quantity < item.quantity) {
                        throw new common_1.BadRequestException('Critical inventory mismatch during payment verification');
                    }
                    await tx.inventory.update({
                        where: { id: inventory.id },
                        data: {
                            quantity: { decrement: item.quantity },
                            reserved_quantity: { decrement: item.quantity }
                        }
                    });
                }
            }
            else if (dto.status === 'FAILED') {
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
    async getPaymentDetails(orderId, userId) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order || order.user_id !== userId)
            throw new common_1.NotFoundException('Order not found');
        const payments = await this.prisma.payment.findMany({
            where: { order_id: orderId },
            orderBy: { created_at: 'desc' }
        });
        return payments;
    }
    async findAllAdmin(page, limit) {
        const { skip, take, page: currentPage, limit: currentLimit } = (0, pagination_util_1.getPaginationParams)(page, limit);
        const [payments, total] = await this.prisma.$transaction([
            this.prisma.payment.findMany({
                skip,
                take,
                orderBy: { created_at: 'desc' },
                include: { order: { select: { order_number: true } } }
            }),
            this.prisma.payment.count()
        ]);
        return (0, pagination_util_1.createPaginationResponse)(payments, total, currentPage, currentLimit);
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        inventory_service_1.InventoryService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map