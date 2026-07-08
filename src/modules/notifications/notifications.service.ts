import { Injectable } from '@nestjs/common';
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

@Injectable()
export class NotificationsService {
  public readonly notificationEvents = new Subject<NotificationPayload>();

  constructor(private readonly prisma: PrismaService) {}

  async createNotification(data: { user_id: string, title: string, message: string, type: string }) {
    const notification = await this.prisma.notification.create({
      data: {
        user_id: data.user_id,
        title: data.title,
        message: data.message,
        type: data.type
      }
    });

    // Emit the event so any connected SSE client receives it immediately
    this.notificationEvents.next(notification);
    
    return notification;
  }
}
