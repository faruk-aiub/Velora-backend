import { PrismaService } from '../../database/prisma.service';
export declare class AdminAnalyticsController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getDashboard(): Promise<{
        success: boolean;
        data: {
            totalSales: number;
            totalOrders: number;
            totalCustomers: number;
            totalProducts: number;
            recentOrders: {
                id: string;
                customer: string;
                date: string;
                total: string;
                status: import("@prisma/client").$Enums.OrderStatus;
            }[];
        };
    }>;
    getSalesReport(): Promise<{
        data: {
            daily: never[];
            weekly: never[];
            monthly: never[];
        };
    }>;
    getUserStats(): Promise<{
        data: {
            total: number;
            newThisMonth: number;
        };
    }>;
}
