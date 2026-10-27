import { PrismaService } from '../../database/prisma.service';
import { InitiatePaymentDto, VerifyPaymentDto } from './dto/payments.dto';
import { InventoryService } from '../inventory/inventory.service';
import { PaginatedResponse } from '../../common/utils/pagination.util';
export declare class PaymentsService {
    private readonly prisma;
    private readonly inventoryService;
    private stripe;
    constructor(prisma: PrismaService, inventoryService: InventoryService);
    initiatePayment(userId: string, dto: InitiatePaymentDto): Promise<{
        paymentId: string;
        message: string;
        paymentUrl?: undefined;
    } | {
        paymentId: string;
        paymentUrl: string | null;
        message?: undefined;
    }>;
    handleStripeWebhook(signature: string, payload: Buffer): Promise<{
        received: boolean;
    }>;
    verifyPayment(dto: VerifyPaymentDto): Promise<{
        id: string;
        updated_at: Date;
        status: import("@prisma/client").$Enums.PaymentStatus;
        created_at: Date;
        order_id: string;
        provider: import("@prisma/client").$Enums.PaymentProvider;
        transaction_id: string | null;
        amount: import("@prisma/client-runtime-utils").Decimal;
        gateway_response: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    getPaymentDetails(orderId: string, userId: string): Promise<{
        id: string;
        updated_at: Date;
        status: import("@prisma/client").$Enums.PaymentStatus;
        created_at: Date;
        order_id: string;
        provider: import("@prisma/client").$Enums.PaymentProvider;
        transaction_id: string | null;
        amount: import("@prisma/client-runtime-utils").Decimal;
        gateway_response: import("@prisma/client/runtime/client").JsonValue | null;
    }[]>;
    findAllAdmin(page?: number, limit?: number): Promise<PaginatedResponse<any>>;
}
