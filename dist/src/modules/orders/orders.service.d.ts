import { PrismaService } from '../../database/prisma.service';
import { PaginatedResponse } from '../../common/utils/pagination.util';
import { OrderStatusEnum } from './dto/orders.dto';
export declare class OrdersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string, page?: number, limit?: number): Promise<PaginatedResponse<any>>;
    findOne(orderId: string, userId: string): Promise<{
        items: {
            id: string;
            sku: string;
            price: import("@prisma/client-runtime-utils").Decimal;
            image_url: string | null;
            quantity: number;
            product_name: string;
        }[];
        id: string;
        created_at: Date;
        status: import("@prisma/client").$Enums.OrderStatus;
        order_number: string;
        total_amount: import("@prisma/client-runtime-utils").Decimal;
        shipping_address: {
            address_line1: string;
            city: string;
            postal_code: string;
        };
        payments: {
            amount: import("@prisma/client-runtime-utils").Decimal;
            provider: import("@prisma/client").$Enums.PaymentProvider;
            status: import("@prisma/client").$Enums.PaymentStatus;
            transaction_id: string | null;
        }[];
        status_history: {
            created_at: Date;
            status: import("@prisma/client").$Enums.OrderStatus;
            notes: string | null;
        }[];
    }>;
    createOrder(userId: string, shippingAddressId: string, cartItems: {
        variantId: string;
        quantity: number;
    }[]): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        order_number: string;
        total_amount: import("@prisma/client-runtime-utils").Decimal;
    }>;
    trackByNumber(orderNumber: string): Promise<{
        created_at: Date;
        status: import("@prisma/client").$Enums.OrderStatus;
        order_number: string;
        status_history: {
            created_at: Date;
            status: import("@prisma/client").$Enums.OrderStatus;
            notes: string | null;
        }[];
    }>;
    findAllAdmin(page?: number, limit?: number): Promise<PaginatedResponse<any>>;
    updateStatus(orderId: string, status: OrderStatusEnum, notes?: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        order_number: string;
        total_amount: import("@prisma/client-runtime-utils").Decimal;
        shipping_address_id: string;
    }>;
}
