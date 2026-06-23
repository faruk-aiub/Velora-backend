import { PaymentsService } from './payments.service';
import type { Request } from 'express';
import { InitiatePaymentDto, VerifyPaymentDto } from './dto/payments.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    initiatePayment(dto: InitiatePaymentDto, req: Request): Promise<{
        message: string;
        data: {
            paymentId: string;
            paymentUrl: string;
            message?: undefined;
        } | {
            paymentId: string;
            message: string;
            paymentUrl?: undefined;
        };
    }>;
    verifyPayment(dto: VerifyPaymentDto): Promise<{
        message: string;
        data: {
            id: string;
            order_id: string;
            provider: import("@prisma/client").$Enums.PaymentProvider;
            status: import("@prisma/client").$Enums.PaymentStatus;
            transaction_id: string | null;
            amount: import("@prisma/client-runtime-utils").Decimal;
            gateway_response: import("@prisma/client/runtime/client").JsonValue | null;
            created_at: Date;
            updated_at: Date;
        };
    }>;
    getPaymentDetails(orderId: string, req: Request): Promise<{
        data: {
            id: string;
            order_id: string;
            provider: import("@prisma/client").$Enums.PaymentProvider;
            status: import("@prisma/client").$Enums.PaymentStatus;
            transaction_id: string | null;
            amount: import("@prisma/client-runtime-utils").Decimal;
            gateway_response: import("@prisma/client/runtime/client").JsonValue | null;
            created_at: Date;
            updated_at: Date;
        }[];
    }>;
    getAllPaymentsAdmin(page: number, limit: number): Promise<import("../../common/utils/pagination.util").PaginatedResponse<any>>;
}
