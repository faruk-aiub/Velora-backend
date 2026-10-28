import type { RawBodyRequest } from '@nestjs/common';
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
            message: string;
            paymentUrl?: undefined;
        } | {
            paymentId: string;
            paymentUrl: string | null;
            message?: undefined;
        };
    }>;
    verifyPayment(dto: VerifyPaymentDto): Promise<{
        message: string;
        data: {
            id: string;
            created_at: Date;
            updated_at: Date;
            amount: import("@prisma/client-runtime-utils").Decimal;
            status: import("@prisma/client").$Enums.PaymentStatus;
            order_id: string;
            provider: import("@prisma/client").$Enums.PaymentProvider;
            transaction_id: string | null;
            gateway_response: import("@prisma/client/runtime/client").JsonValue | null;
        };
    }>;
    stripeWebhook(signature: string, req: RawBodyRequest<Request>): Promise<{
        received: boolean;
    } | {
        received: boolean;
        message: string;
    }>;
    mockGatewayPage(paymentId: string, res: any): void;
    getPaymentDetails(orderId: string, req: Request): Promise<{
        data: {
            id: string;
            created_at: Date;
            updated_at: Date;
            amount: import("@prisma/client-runtime-utils").Decimal;
            status: import("@prisma/client").$Enums.PaymentStatus;
            order_id: string;
            provider: import("@prisma/client").$Enums.PaymentProvider;
            transaction_id: string | null;
            gateway_response: import("@prisma/client/runtime/client").JsonValue | null;
        }[];
    }>;
    getAllPaymentsAdmin(page: number, limit: number): Promise<import("../../common/utils/pagination.util").PaginatedResponse<any>>;
}
