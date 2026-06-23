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
exports.CouponsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const pagination_util_1 = require("../../common/utils/pagination.util");
let CouponsService = class CouponsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const existing = await this.prisma.coupon.findUnique({ where: { code: dto.code.toUpperCase() } });
        if (existing)
            throw new common_1.BadRequestException('Coupon code already exists');
        return this.prisma.coupon.create({
            data: {
                code: dto.code.toUpperCase(),
                discount_type: dto.discount_type,
                discount_value: dto.discount_value,
                min_order_value: dto.min_order_value,
                usage_limit: dto.usage_limit,
                expires_at: dto.expires_at ? new Date(dto.expires_at) : null,
            }
        });
    }
    async findAll(page, limit) {
        const { skip, take, page: currentPage, limit: currentLimit } = (0, pagination_util_1.getPaginationParams)(page, limit);
        const [coupons, total] = await this.prisma.$transaction([
            this.prisma.coupon.findMany({ skip, take, orderBy: { created_at: 'desc' } }),
            this.prisma.coupon.count()
        ]);
        return (0, pagination_util_1.createPaginationResponse)(coupons, total, currentPage, currentLimit);
    }
    async delete(id) {
        const coupon = await this.prisma.coupon.findUnique({ where: { id } });
        if (!coupon)
            throw new common_1.NotFoundException('Coupon not found');
        await this.prisma.coupon.delete({ where: { id } });
        return true;
    }
    async validateAndCalculate(dto) {
        const coupon = await this.prisma.coupon.findUnique({ where: { code: dto.code.toUpperCase() } });
        if (!coupon)
            throw new common_1.NotFoundException('Invalid coupon code');
        if (coupon.expires_at && new Date() > coupon.expires_at) {
            throw new common_1.BadRequestException('Coupon has expired');
        }
        if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
            throw new common_1.BadRequestException('Coupon usage limit exceeded');
        }
        if (coupon.min_order_value && dto.cart_total < Number(coupon.min_order_value)) {
            throw new common_1.BadRequestException(`Minimum order value is \${coupon.min_order_value}`);
        }
        let discountAmount = 0;
        if (coupon.discount_type === 'FIXED') {
            discountAmount = Number(coupon.discount_value);
        }
        else if (coupon.discount_type === 'PERCENT') {
            discountAmount = dto.cart_total * (Number(coupon.discount_value) / 100);
        }
        if (discountAmount > dto.cart_total) {
            discountAmount = dto.cart_total;
        }
        const finalTotal = dto.cart_total - discountAmount;
        return {
            coupon_id: coupon.id,
            code: coupon.code,
            discount_amount: discountAmount,
            final_total: finalTotal
        };
    }
    async redeemCoupon(code) {
        const coupon = await this.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
        if (coupon) {
            await this.prisma.coupon.update({
                where: { id: coupon.id },
                data: { used_count: { increment: 1 } }
            });
        }
    }
};
exports.CouponsService = CouponsService;
exports.CouponsService = CouponsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CouponsService);
//# sourceMappingURL=coupons.service.js.map