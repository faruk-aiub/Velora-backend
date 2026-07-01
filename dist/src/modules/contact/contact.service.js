"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let ContactService = class ContactService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createDto) {
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
    async findOne(id) {
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
            throw new common_1.NotFoundException('Message not found');
        }
        return message;
    }
    async markAsRead(id) {
        await this.findOne(id);
        return this.prisma.contactMessage.update({
            where: { id },
            data: { is_read: true },
        });
    }
    async markAsUnread(id) {
        await this.findOne(id);
        return this.prisma.contactMessage.update({
            where: { id },
            data: { is_read: false },
        });
    }
    async markRepliesAsRead(messageId) {
        return this.prisma.contactReply.updateMany({
            where: {
                message_id: messageId,
                is_read: false,
                sender: { role: 'ADMIN' }
            },
            data: { is_read: true }
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.contactMessage.delete({
            where: { id },
        });
    }
    async findMyMessages(userId) {
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
    async reply(messageId, senderId, messageText, isAdmin) {
        const thread = await this.findOne(messageId);
        const reply = await this.prisma.contactReply.create({
            data: {
                message_id: messageId,
                sender_id: senderId,
                message: messageText,
                is_read: false,
            },
            include: { sender: { select: { role: true, profile: { select: { first_name: true, last_name: true } } } } }
        });
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
            await this.prisma.contactMessage.update({
                where: { id: messageId },
                data: { status: 'PENDING' }
            });
        }
        if (!isAdmin) {
            await this.prisma.contactMessage.update({
                where: { id: messageId },
                data: { status: 'OPEN', is_read: false }
            });
        }
        return reply;
    }
    async updateStatus(id, status) {
        await this.findOne(id);
        return this.prisma.contactMessage.update({
            where: { id },
            data: { status },
        });
    }
};
exports.ContactService = ContactService;
exports.ContactService = ContactService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContactService);
//# sourceMappingURL=contact.service.js.map