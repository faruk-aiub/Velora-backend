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
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let CartService = class CartService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCart(userId) {
        let cart = await this.prisma.cart.findUnique({
            where: { user_id: userId },
            include: {
                items: {
                    include: {
                        variant: {
                            include: {
                                product: {
                                    select: { title: true, slug: true, images: { select: { url: true }, take: 1, orderBy: { sort_order: 'asc' } } }
                                }
                            }
                        }
                    }
                }
            }
        });
        if (!cart) {
            cart = await this.prisma.cart.create({
                data: { user_id: userId },
                include: { items: { include: { variant: { include: { product: true } } } } }
            });
        }
        const total_amount = cart.items.reduce((total, item) => {
            const price = Number(item.variant.compare_price || item.variant.price);
            return total + (price * item.quantity);
        }, 0);
        return {
            ...cart,
            total_amount
        };
    }
    async addItem(userId, dto) {
        let cart = await this.prisma.cart.findUnique({ where: { user_id: userId } });
        if (!cart) {
            cart = await this.prisma.cart.create({ data: { user_id: userId } });
        }
        const variant = await this.prisma.productVariant.findUnique({ where: { id: dto.variant_id } });
        if (!variant)
            throw new common_1.NotFoundException('Variant not found');
        const existingItem = await this.prisma.cartItem.findUnique({
            where: { cart_id_variant_id: { cart_id: cart.id, variant_id: dto.variant_id } }
        });
        if (existingItem) {
            return this.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + dto.quantity }
            });
        }
        else {
            return this.prisma.cartItem.create({
                data: {
                    cart_id: cart.id,
                    variant_id: dto.variant_id,
                    quantity: dto.quantity
                }
            });
        }
    }
    async updateItemQuantity(userId, itemId, dto) {
        const item = await this.prisma.cartItem.findUnique({ where: { id: itemId }, include: { cart: true } });
        if (!item || item.cart.user_id !== userId)
            throw new common_1.NotFoundException('Cart item not found');
        return this.prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity: dto.quantity }
        });
    }
    async removeItem(userId, itemId) {
        const item = await this.prisma.cartItem.findUnique({ where: { id: itemId }, include: { cart: true } });
        if (!item || item.cart.user_id !== userId)
            throw new common_1.NotFoundException('Cart item not found');
        await this.prisma.cartItem.delete({ where: { id: itemId } });
        return true;
    }
    async clearCart(userId) {
        const cart = await this.prisma.cart.findUnique({ where: { user_id: userId } });
        if (!cart)
            return;
        await this.prisma.cartItem.deleteMany({ where: { cart_id: cart.id } });
        return true;
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CartService);
//# sourceMappingURL=cart.service.js.map