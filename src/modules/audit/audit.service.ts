import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async getAuditLogs(limit: number = 50) {
    return this.prisma.auditLog.findMany({
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        user: { select: { email: true, profile: { select: { first_name: true, last_name: true } } } }
      }
    });
  }

  async logAction(userId: string, action: string, entity?: string, entityId?: string, details?: any) {
    return this.prisma.auditLog.create({
      data: {
        user_id: userId,
        action,
        entity,
        entity_id: entityId,
        details
      }
    });
  }
}
