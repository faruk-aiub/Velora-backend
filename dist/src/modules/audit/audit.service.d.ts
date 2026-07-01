import { PrismaService } from '../../database/prisma.service';
export declare class AuditService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getAuditLogs(limit?: number): Promise<({
        user: {
            email: string;
            profile: {
                first_name: string;
                last_name: string;
            } | null;
        } | null;
    } & {
        id: string;
        created_at: Date;
        user_id: string | null;
        ip_address: string | null;
        action: string;
        entity: string | null;
        entity_id: string | null;
        details: import("@prisma/client/runtime/client").JsonValue | null;
    })[]>;
    logAction(userId: string, action: string, entity?: string, entityId?: string, details?: any): Promise<{
        id: string;
        created_at: Date;
        user_id: string | null;
        ip_address: string | null;
        action: string;
        entity: string | null;
        entity_id: string | null;
        details: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
}
