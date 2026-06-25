import { PrismaService } from '../../database/prisma.service';
import { InitiatePaymentDto, VerifyPaymentDto } from './dto/payments.dto';
import { InventoryService } from '../inventory/inventory.service';
import { PaginatedResponse } from '../../common/utils/pagination.util';
export declare class PaymentsService {
    private readonly prisma;
    private readonly inventoryService;
    constructor(prisma: PrismaService, inventoryService: InventoryService);
    initiatePayment(userId: string, dto: InitiatePaymentDto): Promise<{
        paymentId: string;
        paymentUrl: string;
        message?: undefined;
    } | {
        paymentId: string;
        message: string;
        paymentUrl?: undefined;
    }>;
    verifyPayment(dto: VerifyPaymentDto): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        amount: import("@prisma/client-runtime-utils").Decimal;
        provider: import("@prisma/client").$Enums.PaymentProvider;
        status: import("@prisma/client").$Enums.PaymentStatus;
        order_id: string;
        transaction_id: string | null;
        gateway_response: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    getPaymentDetails(orderId: string, userId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        amount: import("@prisma/client-runtime-utils").Decimal;
        provider: import("@prisma/client").$Enums.PaymentProvider;
        status: import("@prisma/client").$Enums.PaymentStatus;
        order_id: string;
        transaction_id: string | null;
        gateway_response: import("@prisma/client/runtime/client").JsonValue | null;
    }[]>;
    findAllAdmin(page?: number, limit?: number): Promise<PaginatedResponse<any>>;
}
