export declare class AdminAnalyticsController {
    getDashboard(): Promise<{
        data: {
            totalRevenue: number;
            totalOrders: number;
            activeUsers: number;
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
