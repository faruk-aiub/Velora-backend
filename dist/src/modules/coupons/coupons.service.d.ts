import { PrismaService } from '../../database/prisma.service';
import { CreateCouponDto, ValidateCouponDto } from './dto/coupons.dto';
import { PaginatedResponse } from '../../common/utils/pagination.util';
export declare class CouponsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateCouponDto): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        expires_at: Date | null;
        code: string;
        discount_type: import("@prisma/client").$Enums.DiscountType;
        discount_value: import("@prisma/client-runtime-utils").Decimal;
        min_order_value: import("@prisma/client-runtime-utils").Decimal | null;
        usage_limit: number | null;
        used_count: number;
    }>;
    findAll(page?: number, limit?: number): Promise<PaginatedResponse<any>>;
    delete(id: string): Promise<boolean>;
    validateAndCalculate(dto: ValidateCouponDto): Promise<{
        coupon_id: string;
        code: string;
        discount_amount: number;
        final_total: number;
    }>;
    redeemCoupon(code: string): Promise<void>;
}
