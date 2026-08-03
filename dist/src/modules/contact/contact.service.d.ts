import { PrismaService } from '../../database/prisma.service';
import { CreateContactMessageDto } from './dto/create-contact.dto';
export declare class ContactService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createDto: CreateContactMessageDto): Promise<{
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
    }>;
    findAll(): Promise<{
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
    }[]>;
    getUnreadCount(): Promise<{
        count: number;
    }>;
    findOne(id: string): Promise<{
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
    }>;
    markAsRead(id: string): Promise<{
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
    }>;
    markAsUnread(id: string): Promise<{
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
    }>;
    markRepliesAsRead(messageId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    remove(id: string): Promise<{
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
    }>;
    findMyMessages(userId: string): Promise<({
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
    })[]>;
    reply(messageId: string, senderId: string, messageText: string, isAdmin: boolean): Promise<{
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
    }>;
    updateStatus(id: string, status: string): Promise<{
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
    }>;
}
