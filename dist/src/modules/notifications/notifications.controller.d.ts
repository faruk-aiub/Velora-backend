import type { Request } from 'express';
export declare class NotificationsController {
    getNotifications(req: Request): Promise<{
        data: never[];
        meta: {
            total: number;
            page: number;
            limit: number;
            hasNextPage: boolean;
        };
    }>;
    markAsRead(body: {
        notificationIds?: string[];
    }, req: Request): Promise<{
        message: string;
    }>;
    deleteNotification(id: string, req: Request): Promise<{
        message: string;
    }>;
}
