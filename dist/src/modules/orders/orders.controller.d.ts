import { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
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
            order_number: string;
            total_amount: import("@prisma/client-runtime-utils").Decimal;
            status: import("@prisma/client").$Enums.OrderStatus;
        };
    }>;
    getUserOrders(req: Request, page: number, limit: number): Promise<import("../../common/utils/pagination.util").PaginatedResponse<any>>;
    streamOrderUpdates(req: Request): Observable<MessageEvent>;
    getOrderDetails(req: Request, id: string): Promise<{
        data: {
            id: string;
            order_number: string;
            total_amount: import("@prisma/client-runtime-utils").Decimal;
            status: import("@prisma/client").$Enums.OrderStatus;
            created_at: Date;
            shipping_address: {
                address_line1: string;
                city: string;
                postal_code: string;
            };
            items: {
                id: string;
                quantity: number;
                price: import("@prisma/client-runtime-utils").Decimal;
                product_name: string;
                sku: string;
                image_url: string | null;
            }[];
            payments: {
                status: import("@prisma/client").$Enums.PaymentStatus;
                provider: import("@prisma/client").$Enums.PaymentProvider;
                transaction_id: string | null;
                amount: import("@prisma/client-runtime-utils").Decimal;
            }[];
            status_history: {
                status: import("@prisma/client").$Enums.OrderStatus;
                created_at: Date;
                notes: string | null;
            }[];
        };
    }>;
    trackOrder(orderNumber: string): Promise<{
        data: {
            order_number: string;
            status: import("@prisma/client").$Enums.OrderStatus;
            created_at: Date;
            status_history: {
                status: import("@prisma/client").$Enums.OrderStatus;
                created_at: Date;
                notes: string | null;
            }[];
        };
    }>;
    getAllOrdersAdmin(page: number, limit: number): Promise<import("../../common/utils/pagination.util").PaginatedResponse<any>>;
    updateOrderStatus(id: string, body: UpdateOrderStatusDto): Promise<{
        message: string;
        data: {
            id: string;
            user_id: string;
            order_number: string;
            customer_name: string;
            contact_number: string;
            total_amount: import("@prisma/client-runtime-utils").Decimal;
            status: import("@prisma/client").$Enums.OrderStatus;
            shipping_address_id: string;
            created_at: Date;
            updated_at: Date;
        };
    }>;
}
