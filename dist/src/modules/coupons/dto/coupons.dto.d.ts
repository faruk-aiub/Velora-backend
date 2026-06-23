export declare enum DiscountTypeEnum {
    PERCENT = "PERCENT",
    FIXED = "FIXED"
}
export declare class CreateCouponDto {
    code: string;
    discount_type: DiscountTypeEnum;
    discount_value: number;
    min_order_value?: number;
    usage_limit?: number;
    expires_at?: string;
}
export declare class ValidateCouponDto {
    code: string;
    cart_total: number;
}
