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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const payments_dto_1 = require("./dto/payments.dto");
const inventory_service_1 = require("../inventory/inventory.service");
const pagination_util_1 = require("../../common/utils/pagination.util");
const stripe_1 = __importDefault(require("stripe"));
let PaymentsService = class PaymentsService {
    prisma;
    inventoryService;
    stripe;
    constructor(prisma, inventoryService) {
        this.prisma = prisma;
        this.inventoryService = inventoryService;
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
            apiVersion: '2023-10-16',
        });
    }
    async initiatePayment(userId, dto) {
        const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.user_id !== userId)
            throw new common_1.BadRequestException('Unauthorized order access');
        if (order.status !== 'PENDING')
            throw new common_1.BadRequestException('Order is no longer pending');
        let payment = await this.prisma.payment.findFirst({
            where: { order_id: order.id, status: 'PENDING' }
        });
        if (!payment) {
            payment = await this.prisma.payment.create({
                data: {
                    order_id: order.id,
                    provider: dto.provider,
                    amount: order.total_amount,
                    status: 'PENDING'
                }
            });
        }
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
        if (dto.provider === 'STRIPE') {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: `Order #${order.order_number}`,
                            },
                            unit_amount: Math.round(Number(order.total_amount) * 100),
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
                cancel_url: `${frontendUrl}/checkout/cancel?order_id=${order.id}`,
                client_reference_id: payment.id,
                metadata: {
                    orderId: order.id,
                    paymentId: payment.id
                }
            });
            return {
                paymentId: payment.id,
                paymentUrl: session.url
            };
        }
        throw new common_1.BadRequestException('Invalid payment provider');
    }
    async handleStripeWebhook(signature, payload) {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        let event;
        try {
            if (webhookSecret) {
                event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
            }
            else {
                event = JSON.parse(payload.toString());
            }
        }
        catch (err) {
            throw new common_1.BadRequestException(`Webhook Error: ${err.message}`);
        }
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const paymentId = session.client_reference_id;
            if (paymentId) {
                await this.verifyPayment({
                    paymentId: paymentId,
                    status: payments_dto_1.PaymentStatusEnum.SUCCESS,
                    transactionId: session.payment_intent || session.id
                });
            }
        }
        return { received: true };
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