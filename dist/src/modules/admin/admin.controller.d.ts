import { PrismaService } from '../../database/prisma.service';
export declare class AdminAnalyticsController {
    private readonly prisma;
    private dashboardCache;
    private salesReportCache;
    private userStatsCache;
    private readonly CACHE_TTL;
    constructor(prisma: PrismaService);
    getDashboard(): Promise<any>;
    getSalesReport(): Promise<any>;
    getUserStats(): Promise<any>;
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
    updateAdminStatus(id: string, dto: {
        is_active: boolean;
    }): Promise<{
        message: string;
        data: {
            id: string;
            email: string;
            is_active: boolean;
        };
    }>;
    deleteAdmin(id: string): Promise<{
        message: string;
    }>;
}
