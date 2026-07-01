import { PrismaService } from '../../database/prisma.service';
import type { Request } from 'express';
export declare class NotificationsController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getNotifications(req: Request): Promise<{
        data: {
            id: string;
            created_at: Date;
            title: string;
            user_id: string;
            type: string;
            message: string;
            is_read: boolean;
            link_url: string | null;
        }[];
    }>;
    getUnreadCount(req: Request): Promise<{
        count: number;
    }>;
    markAsRead(body: {
        notificationIds?: string[];
    }, req: Request): Promise<{
        message: string;
    }>;
    deleteNotification(id: string, req: Request): Promise<{
        message: string;
    }>;
    sendNotificationAdmin(body: {
        title: string;
        message: string;
        user_id?: string;
        type?: string;
    }): Promise<{
        message: string;
    }>;
    getAllNotificationsAdmin(): Promise<{
        data: ({
            user: {
                email: string;
            };
        } & {
            id: string;
            created_at: Date;
            title: string;
            user_id: string;
            type: string;
            message: string;
            is_read: boolean;
            link_url: string | null;
        })[];
    }>;
}
