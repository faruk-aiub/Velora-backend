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
            monthly: {
                name: string;
                total: any;
            }[];
        };
    }>;
    getUserStats(): Promise<{
        data: {
            total: number;
            newThisMonth: number;
        };
    }>;
    getAdmins(): Promise<{
        data: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
            is_active: boolean;
            created_at: Date;
            profile: {
                id: string;
                created_at: Date;
                updated_at: Date;
                first_name: string;
                last_name: string;
                phone: string | null;
                avatar_url: string | null;
                user_id: string;
            } | null;
        }[];
    }>;
    createAdmin(dto: any): Promise<{
        message: string;
        data: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
}
