export declare enum PaymentProviderEnum {
    BKASH = "BKASH",
    NAGAD = "NAGAD",
    COD = "COD"
}
export declare enum PaymentStatusEnum {
    PENDING = "PENDING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}
export declare class InitiatePaymentDto {
    orderId: string;
    provider: PaymentProviderEnum;
}
export declare class VerifyPaymentDto {
    paymentId: string;
    status: PaymentStatusEnum;
    transactionId?: string;
}
