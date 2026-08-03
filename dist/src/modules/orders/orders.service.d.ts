import { PrismaService } from '../../database/prisma.service';
import { CreateOrderDto } from './dto/orders.dto';
import { PaginatedResponse } from '../../common/utils/pagination.util';
import { OrderStatusEnum } from './dto/orders.dto';
import { Subject } from 'rxjs';
import { NotificationsService } from '../notifications/notifications.service';
export declare class OrdersService {
    private readonly prisma;
    private readonly notificationsService;
    readonly orderStatusEvents: Subject<{
        userId: string;
        orderId: string;
        status: string;
        type: string;
    }>;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    findAll(userId: string, page?: number, limit?: number): Promise<PaginatedResponse<any>>;
    findOne(orderId: string, userId: string): Promise<{
        id: string;
        created_at: Date;
        items: {
            id: string;
            image_url: string | null;
            sku: string;
            price: import("@prisma/client-runtime-utils").Decimal;
            quantity: number;
            product_name: string;
        }[];
        order_number: string;
        total_amount: import("@prisma/client-runtime-utils").Decimal;
        status: import("@prisma/client").$Enums.OrderStatus;
        shipping_address: {
            address_line1: string;
            city: string;
            postal_code: string;
        };
        payments: {
            status: import("@prisma/client").$Enums.PaymentStatus;
            provider: import("@prisma/client").$Enums.PaymentProvider;
            transaction_id: string | null;
            amount: import("@prisma/client-runtime-utils").Decimal;
        }[];
        status_history: {
            created_at: Date;
            status: import("@prisma/client").$Enums.OrderStatus;
            notes: string | null;
        }[];
    }>;
    createOrder(userId: string, dto: CreateOrderDto): Promise<{
        id: string;
        order_number: string;
        total_amount: import("@prisma/client-runtime-utils").Decimal;
        status: import("@prisma/client").$Enums.OrderStatus;
    }>;
    trackByNumber(orderNumber: string): Promise<{
        created_at: Date;
        order_number: string;
        status: import("@prisma/client").$Enums.OrderStatus;
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
        order_number: string;
        customer_name: string;
        contact_number: string;
        total_amount: import("@prisma/client-runtime-utils").Decimal;
        status: import("@prisma/client").$Enums.OrderStatus;
        shipping_address_id: string;
    }>;
}
