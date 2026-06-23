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
exports.WishlistService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let WishlistService = class WishlistService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getWishlist(userId) {
        return this.prisma.wishlist.findMany({
            where: { user_id: userId },
            include: {
                product: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        images: {
                            select: { url: true },
                            take: 1,
                            orderBy: { sort_order: 'asc' }
                        },
                        variants: {
                            select: { price: true, compare_price: true },
                            take: 1
                        }
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });
    }
    async toggleWishlistItem(userId, productId) {
        const product = await this.prisma.product.findUnique({ where: { id: productId } });
        if (!product || product.deleted_at)
            throw new common_1.NotFoundException('Product not found');
        const existing = await this.prisma.wishlist.findUnique({
            where: { user_id_product_id: { user_id: userId, product_id: productId } }
        });
        if (existing) {
            await this.prisma.wishlist.delete({ where: { id: existing.id } });
            return { message: 'Removed from wishlist', status: 'removed' };
        }
        else {
            await this.prisma.wishlist.create({
                data: { user_id: userId, product_id: productId }
            });
            return { message: 'Added to wishlist', status: 'added' };
        }
    }
};
exports.WishlistService = WishlistService;
exports.WishlistService = WishlistService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WishlistService);
//# sourceMappingURL=wishlist.service.js.map