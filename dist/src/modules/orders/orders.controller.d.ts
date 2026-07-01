import { OrdersService } from './orders.service';
import type { Request } from 'express';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/orders.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    createOrder(req: Request, body: CreateOrderDto): Promise<{
        message: string;
        data: {
            id: string;
            status: import("@prisma/client").$Enums.OrderStatus;
            order_number: string;
            total_amount: import("@prisma/client-runtime-utils").Decimal;
        };
    }>;
    getUserOrders(req: Request, page: number, limit: number): Promise<import("../../common/utils/pagination.util").PaginatedResponse<any>>;
    getOrderDetails(req: Request, id: string): Promise<{
        data: {
            id: string;
            created_at: Date;
            items: {
                id: string;
                sku: string;
                price: import("@prisma/client-runtime-utils").Decimal;
                image_url: string | null;
                quantity: number;
                product_name: string;
            }[];
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
                status: import("@prisma/client").$Enums.PaymentStatus;
                provider: import("@prisma/client").$Enums.PaymentProvider;
                transaction_id: string | null;
            }[];
            status_history: {
                created_at: Date;
                status: import("@prisma/client").$Enums.OrderStatus;
                notes: string | null;
            }[];
        };
    }>;
    trackOrder(orderNumber: string): Promise<{
        data: {
            created_at: Date;
            status: import("@prisma/client").$Enums.OrderStatus;
            order_number: string;
            status_history: {
                created_at: Date;
                status: import("@prisma/client").$Enums.OrderStatus;
                notes: string | null;
            }[];
        };
    }>;
    getAllOrdersAdmin(page: number, limit: number): Promise<import("../../common/utils/pagination.util").PaginatedResponse<any>>;
    updateOrderStatus(id: string, body: UpdateOrderStatusDto): Promise<{
        message: string;
        data: {
            id: string;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            status: import("@prisma/client").$Enums.OrderStatus;
            order_number: string;
            total_amount: import("@prisma/client-runtime-utils").Decimal;
            shipping_address_id: string;
        };
    }>;
}
