import { PrismaService } from '../../database/prisma.service';
import { Subject } from 'rxjs';
export interface NotificationPayload {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: Date;
}
export declare class NotificationsService {
    private readonly prisma;
    readonly notificationEvents: Subject<NotificationPayload>;
    constructor(prisma: PrismaService);
    createNotification(data: {
        user_id: string;
        title: string;
        message: string;
        type: string;
    }): Promise<{
        id: string;
        created_at: Date;
        type: string;
        title: string;
        message: string;
        user_id: string;
        is_read: boolean;
        link_url: string | null;
    }>;
}
