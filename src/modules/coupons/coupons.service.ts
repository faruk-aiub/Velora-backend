import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCouponDto, ValidateCouponDto } from './dto/coupons.dto';
import { getPaginationParams, createPaginationResponse, PaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  // --- ADMIN METHODS ---

  async create(dto: CreateCouponDto) {
    const existing = await this.prisma.coupon.findUnique({ where: { code: dto.code.toUpperCase() } });
    if (existing) throw new BadRequestException('Coupon code already exists');

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

  async findAll(page?: number, limit?: number): Promise<PaginatedResponse<any>> {
    const { skip, take, page: currentPage, limit: currentLimit } = getPaginationParams(page, limit);

    const [coupons, total] = await this.prisma.$transaction([
      this.prisma.coupon.findMany({ skip, take, orderBy: { created_at: 'desc' } }),
      this.prisma.coupon.count()
    ]);

    return createPaginationResponse(coupons, total, currentPage, currentLimit);
  }

  async delete(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');

    await this.prisma.coupon.delete({ where: { id } });
    return true;
  }

  // --- USER METHODS ---

  async validateAndCalculate(dto: ValidateCouponDto) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code: dto.code.toUpperCase() } });
    if (!coupon) throw new NotFoundException('Invalid coupon code');

    // Check expiration
    if (coupon.expires_at && new Date() > coupon.expires_at) {
      throw new BadRequestException('Coupon has expired');
    }

    // Check usage limits
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      throw new BadRequestException('Coupon usage limit exceeded');
    }

    // Check min order value
    if (coupon.min_order_value && dto.cart_total < Number(coupon.min_order_value)) {
      throw new BadRequestException(`Minimum order value is \${coupon.min_order_value}`);
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === 'FIXED') {
      discountAmount = Number(coupon.discount_value);
    } else if (coupon.discount_type === 'PERCENT') {
      discountAmount = dto.cart_total * (Number(coupon.discount_value) / 100);
    }

    // Ensure discount doesn't exceed total
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

  async redeemCoupon(code: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (coupon) {
      await this.prisma.coupon.update({
        where: { id: coupon.id },
        data: { used_count: { increment: 1 } }
      });
    }
  }
}
