import { ContactService } from './contact.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateContactMessageDto } from './dto/create-contact.dto';
import { ReplyContactMessageDto } from './dto/reply-contact.dto';
import { UpdateContactStatusDto } from './dto/update-contact-status.dto';
export declare class ContactController {
    private readonly contactService;
    private readonly notificationsService;
    constructor(contactService: ContactService, notificationsService: NotificationsService);
    create(createDto: CreateContactMessageDto): Promise<{
        message: string;
        data: {
            id: string;
            first_name: string;
            last_name: string;
            email: string;
            subject: string | null;
            message: string;
            is_read: boolean;
            status: string;
            created_at: Date;
            updated_at: Date;
            user_id: string | null;
        };
    }>;
    getMyMessages(req: any): Promise<{
        data: ({
            _count: {
                replies: number;
            };
        } & {
            id: string;
            first_name: string;
            last_name: string;
            email: string;
            subject: string | null;
            message: string;
            is_read: boolean;
            status: string;
            created_at: Date;
            updated_at: Date;
            user_id: string | null;
        })[];
    }>;
    getUnreadCount(): Promise<{
        count: number;
    }>;
    getOne(id: string, req: any): Promise<{
        data: {
            user: {
                email: string;
                profile: {
                    first_name: string;
                    last_name: string;
                } | null;
            } | null;
            replies: ({
                sender: {
                    role: import("@prisma/client").$Enums.Role;
                    profile: {
                        first_name: string;
                        last_name: string;
                    } | null;
                } | null;
            } & {
                id: string;
                message: string;
                is_read: boolean;
                created_at: Date;
                message_id: string;
                sender_id: string | null;
            })[];
        } & {
            id: string;
            first_name: string;
            last_name: string;
            email: string;
            subject: string | null;
            message: string;
            is_read: boolean;
            status: string;
            created_at: Date;
            updated_at: Date;
            user_id: string | null;
        };
    }>;
    markRepliesAsRead(id: string, req: any): Promise<{
        message: string;
    }>;
    reply(id: string, dto: ReplyContactMessageDto, req: any): Promise<{
        message: string;
        data: {
            sender: {
                role: import("@prisma/client").$Enums.Role;
                profile: {
                    first_name: string;
                    last_name: string;
                } | null;
            } | null;
        } & {
            id: string;
            message: string;
            is_read: boolean;
            created_at: Date;
            message_id: string;
            sender_id: string | null;
        };
    }>;
    findAll(): Promise<{
        data: {
            id: string;
            first_name: string;
            last_name: string;
            email: string;
            subject: string | null;
            message: string;
            is_read: boolean;
            status: string;
            created_at: Date;
            updated_at: Date;
            user_id: string | null;
        }[];
    }>;
    updateStatus(id: string, dto: UpdateContactStatusDto): Promise<{
        message: string;
        data: {
            id: string;
            first_name: string;
            last_name: string;
            email: string;
            subject: string | null;
            message: string;
            is_read: boolean;
            status: string;
            created_at: Date;
            updated_at: Date;
            user_id: string | null;
        };
    }>;
    markAsRead(id: string): Promise<{
        message: string;
        data: {
            id: string;
            first_name: string;
            last_name: string;
            email: string;
            subject: string | null;
            message: string;
            is_read: boolean;
            status: string;
            created_at: Date;
            updated_at: Date;
            user_id: string | null;
        };
    }>;
    markAsUnread(id: string): Promise<{
        message: string;
        data: {
            id: string;
            first_name: string;
            last_name: string;
            email: string;
            subject: string | null;
            message: string;
            is_read: boolean;
            status: string;
            created_at: Date;
            updated_at: Date;
            user_id: string | null;
        };
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
