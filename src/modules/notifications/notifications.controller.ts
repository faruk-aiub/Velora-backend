import {  ApiTags , ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { Request } from 'express';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {

  @Get()
  async getNotifications(@Req() req: Request) {
    return { data: [], meta: { total: 0, page: 1, limit: 10, hasNextPage: false } };
  }

  @Post('mark-read')
  async markAsRead(@Body() body: { notificationIds?: string[] }, @Req() req: Request) {
    return { message: 'Notifications marked as read' };
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string, @Req() req: Request) {
    return { message: 'Notification deleted' };
  }
}
