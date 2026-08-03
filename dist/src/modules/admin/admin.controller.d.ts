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
            topProducts: {
                name: any;
                sales: number;
                price: string;
            }[];
        };
    }>;
    getSalesReport(): Promise<{
        data: {
            monthly: {
                name: string;
                total: any;
            }[];
            weekly: {
                name: any;
                revenue: any;
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
            role: import("@prisma/client").$Enums.Role;
            is_active: boolean;
            id: string;
            created_at: Date;
            email: string;
            profile: {
                id: string;
                user_id: string;
                created_at: Date;
                updated_at: Date;
                first_name: string;
                last_name: string;
                phone: string | null;
                avatar_url: string | null;
            } | null;
        }[];
    }>;
    createAdmin(dto: any): Promise<{
        message: string;
        data: {
            role: import("@prisma/client").$Enums.Role;
            id: string;
            email: string;
        };
    }>;
    updateAdminStatus(id: string, dto: {
        is_active: boolean;
    }): Promise<{
        message: string;
        data: {
            is_active: boolean;
            id: string;
            email: string;
        };
    }>;
    deleteAdmin(id: string): Promise<{
        message: string;
    }>;
}
