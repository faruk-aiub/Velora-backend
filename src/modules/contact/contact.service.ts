import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateContactMessageDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateContactMessageDto) {
    return this.prisma.contactMessage.create({
      data: createDto,
    });
  }

  async findAll() {
    return this.prisma.contactMessage.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  async getUnreadCount() {
    const count = await this.prisma.contactMessage.count({
      where: { is_read: false },
    });
    return { count };
  }

  async findOne(id: string) {
    const message = await this.prisma.contactMessage.findUnique({
      where: { id },
      include: {
        replies: {
          orderBy: { created_at: 'asc' },
          include: { sender: { select: { role: true, profile: { select: { first_name: true, last_name: true } } } } }
        },
        user: { select: { email: true, profile: { select: { first_name: true, last_name: true } } } }
      }
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return message;
  }

  async markAsRead(id: string) {
    await this.findOne(id); // Ensure it exists

    return this.prisma.contactMessage.update({
      where: { id },
      data: { is_read: true },
    });
  }

  async markAsUnread(id: string) {
    await this.findOne(id); // Ensure it exists

    return this.prisma.contactMessage.update({
      where: { id },
      data: { is_read: false },
    });
  }

  async markRepliesAsRead(messageId: string) {
    return this.prisma.contactReply.updateMany({
      where: { 
        message_id: messageId,
        is_read: false,
        sender: { role: 'ADMIN' }
      },
      data: { is_read: true }
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Ensure it exists

    return this.prisma.contactMessage.delete({
      where: { id },
    });
  }

  // --- USER METHODS ---
  async findMyMessages(userId: string) {
    return this.prisma.contactMessage.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      include: {
        _count: {
          select: { replies: { where: { is_read: false, sender: { role: 'ADMIN' } } } }
        }
      }
    });
  }

  // --- SHARED METHODS ---
  async reply(messageId: string, senderId: string, messageText: string, isAdmin: boolean) {
    const thread = await this.findOne(messageId);

    // Create the reply
    const reply = await this.prisma.contactReply.create({
      data: {
        message_id: messageId,
        sender_id: senderId,
        message: messageText,
        is_read: false, // unread for the recipient
      },
      include: { sender: { select: { role: true, profile: { select: { first_name: true, last_name: true } } } } }
    });

    // If admin replies, notify the user
    if (isAdmin && thread.user_id) {
      await this.prisma.notification.create({
        data: {
          user_id: thread.user_id,
          title: 'New Reply from Support',
          message: `An admin has replied to your message regarding "${thread.subject || 'Support Ticket'}".`,
          type: 'MESSAGE',
          link_url: `/account?tab=messages&id=${messageId}`
        }
      });
      // Optionally mark the parent message as PENDING when admin replies
      await this.prisma.contactMessage.update({
        where: { id: messageId },
        data: { status: 'PENDING' }
      });
    }

    // If user replies, mark parent message as OPEN (so admin knows it needs attention) and unread
    if (!isAdmin) {
      await this.prisma.contactMessage.update({
        where: { id: messageId },
        data: { status: 'OPEN', is_read: false }
      });
    }

    return reply;
  }

  async updateStatus(id: string, status: string) {
    await this.findOne(id);
    return this.prisma.contactMessage.update({
      where: { id },
      data: { status },
    });
  }
}
