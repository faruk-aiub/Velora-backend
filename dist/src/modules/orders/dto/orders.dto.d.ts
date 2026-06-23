export declare class CartItemDto {
    variantId: string;
    quantity: number;
}
export declare class CreateOrderDto {
    shippingAddressId: string;
    cartItems: CartItemDto[];
}
export declare enum OrderStatusEnum {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    PROCESSING = "PROCESSING",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
    RETURNED = "RETURNED"
}
export declare class UpdateOrderStatusDto {
    status: OrderStatusEnum;
}
