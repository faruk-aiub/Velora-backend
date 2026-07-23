import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    getAuditLogs(limit?: number): Promise<{
        data: ({
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
        })[];
    }>;
}
