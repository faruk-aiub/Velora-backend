import { CouponsService } from './coupons.service';
import { CreateCouponDto, ValidateCouponDto } from './dto/coupons.dto';
export declare class CouponsController {
    private readonly couponsService;
    constructor(couponsService: CouponsService);
    validateCoupon(dto: ValidateCouponDto): Promise<{
        message: string;
        data: {
            coupon_id: string;
            code: string;
            discount_amount: number;
            final_total: number;
        };
    }>;
    createCoupon(dto: CreateCouponDto): Promise<{
        message: string;
        data: {
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
        };
    }>;
    getAllCouponsAdmin(page: number, limit: number): Promise<import("../../common/utils/pagination.util").PaginatedResponse<any>>;
    deleteCoupon(id: string): Promise<{
        message: string;
    }>;
}
