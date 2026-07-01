import {  ApiTags , ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PrismaService } from '../../database/prisma.service';
import type { Request } from 'express';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {

  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getNotifications(@Req() req: Request) {
    const userId = (req as any).user.sub;
    const notifications = await this.prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });
    return { data: notifications };
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: Request) {
    const userId = (req as any).user.sub;
    const count = await this.prisma.notification.count({
      where: { user_id: userId, is_read: false }
    });
    return { count };
  }

  @Post('mark-read')
  async markAsRead(@Body() body: { notificationIds?: string[] }, @Req() req: Request) {
    const userId = (req as any).user.sub;
    await this.prisma.notification.updateMany({
      where: { user_id: userId, ...(body.notificationIds ? { id: { in: body.notificationIds } } : {}) },
      data: { is_read: true }
    });
    return { message: 'Notifications marked as read' };
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any).user.sub;
    await this.prisma.notification.deleteMany({
      where: { id, user_id: userId }
    });
    return { message: 'Notification deleted' };
  }

  // --- ADMIN APIs ---

  @ApiBearerAuth()
  @Post('admin/send')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async sendNotificationAdmin(@Body() body: { title: string, message: string, user_id?: string, type?: string }) {
    if (body.user_id && body.user_id !== 'all') {
      await this.prisma.notification.create({
        data: {
          user_id: body.user_id,
          title: body.title,
          message: body.message,
          type: body.type || 'SYSTEM'
        }
      });
    } else {
      // Send to all users
      const users = await this.prisma.user.findMany({ select: { id: true } });
      await this.prisma.notification.createMany({
        data: users.map(u => ({
          user_id: u.id,
          title: body.title,
          message: body.message,
          type: body.type || 'SYSTEM'
        }))
      });
    }
    return { message: 'Notification sent successfully' };
  }

  @ApiBearerAuth()
  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async getAllNotificationsAdmin() {
    const notifications = await this.prisma.notification.findMany({
      orderBy: { created_at: 'desc' },
      include: { user: { select: { email: true } } },
      take: 50
    });
    return { data: notifications };
  }
}
