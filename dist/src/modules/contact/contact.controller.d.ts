import { ContactService } from './contact.service';
import { CreateContactMessageDto } from './dto/create-contact.dto';
import { ReplyContactMessageDto } from './dto/reply-contact.dto';
import { UpdateContactStatusDto } from './dto/update-contact-status.dto';
export declare class ContactController {
    private readonly contactService;
    constructor(contactService: ContactService);
    create(createDto: CreateContactMessageDto): Promise<{
        message: string;
        data: {
            id: string;
            email: string;
            created_at: Date;
            updated_at: Date;
            first_name: string;
            last_name: string;
            subject: string | null;
            user_id: string | null;
            message: string;
            status: string;
            is_read: boolean;
        };
    }>;
    getMyMessages(req: any): Promise<{
        data: ({
            _count: {
                replies: number;
            };
        } & {
            id: string;
            email: string;
            created_at: Date;
            updated_at: Date;
            first_name: string;
            last_name: string;
            subject: string | null;
            user_id: string | null;
            message: string;
            status: string;
            is_read: boolean;
        })[];
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
                created_at: Date;
                message: string;
                is_read: boolean;
                message_id: string;
                sender_id: string | null;
            })[];
        } & {
            id: string;
            email: string;
            created_at: Date;
            updated_at: Date;
            first_name: string;
            last_name: string;
            subject: string | null;
            user_id: string | null;
            message: string;
            status: string;
            is_read: boolean;
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
            created_at: Date;
            message: string;
            is_read: boolean;
            message_id: string;
            sender_id: string | null;
        };
    }>;
    findAll(): Promise<{
        data: {
            id: string;
            email: string;
            created_at: Date;
            updated_at: Date;
            first_name: string;
            last_name: string;
            subject: string | null;
            user_id: string | null;
            message: string;
            status: string;
            is_read: boolean;
        }[];
    }>;
    getUnreadCount(): Promise<{
        count: number;
    }>;
    updateStatus(id: string, dto: UpdateContactStatusDto): Promise<{
        message: string;
        data: {
            id: string;
            email: string;
            created_at: Date;
            updated_at: Date;
            first_name: string;
            last_name: string;
            subject: string | null;
            user_id: string | null;
            message: string;
            status: string;
            is_read: boolean;
        };
    }>;
    markAsRead(id: string): Promise<{
        message: string;
        data: {
            id: string;
            email: string;
            created_at: Date;
            updated_at: Date;
            first_name: string;
            last_name: string;
            subject: string | null;
            user_id: string | null;
            message: string;
            status: string;
            is_read: boolean;
        };
    }>;
    markAsUnread(id: string): Promise<{
        message: string;
        data: {
            id: string;
            email: string;
            created_at: Date;
            updated_at: Date;
            first_name: string;
            last_name: string;
            subject: string | null;
            user_id: string | null;
            message: string;
            status: string;
            is_read: boolean;
        };
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
