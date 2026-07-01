import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { CreateContactMessageDto } from './dto/create-contact.dto';
import { ReplyContactMessageDto } from './dto/reply-contact.dto';
import { UpdateContactStatusDto } from './dto/update-contact-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  // Public endpoint for users to submit messages
  @Post()
  async create(@Body() createDto: CreateContactMessageDto) {
    const message = await this.contactService.create(createDto);
    return { message: 'Message sent successfully', data: message };
  }

  @Get('my-messages')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getMyMessages(@Req() req: any) {
    const messages = await this.contactService.findMyMessages(req.user.sub);
    return { data: messages };
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getOne(@Param('id') id: string, @Req() req: any) {
    const message = await this.contactService.findOne(id);
    
    // Simple authorization: Only admin or the owner can view this message
    if (req.user.role !== 'ADMIN' && message.user_id !== req.user.sub) {
      throw new ForbiddenException('You do not have access to this conversation.');
    }
    
    return { data: message };
  }

  @Patch(':id/read-replies')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async markRepliesAsRead(@Param('id') id: string, @Req() req: any) {
    const message = await this.contactService.findOne(id);
    
    // Only the owner can mark replies as read
    if (message.user_id !== req.user.sub) {
      throw new ForbiddenException('You do not have access to this conversation.');
    }
    
    await this.contactService.markRepliesAsRead(id);
    return { message: 'Replies marked as read' };
  }

  @Post(':id/reply')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async reply(
    @Param('id') id: string,
    @Body() dto: ReplyContactMessageDto,
    @Req() req: any
  ) {
    const message = await this.contactService.findOne(id);
    if (req.user.role !== 'ADMIN' && message.user_id !== req.user.sub) {
      throw new ForbiddenException('You do not have access to this conversation.');
    }

    const isAdmin = req.user.role === 'ADMIN';
    const reply = await this.contactService.reply(id, req.user.sub, dto.message, isAdmin);
    return { message: 'Reply sent', data: reply };
  }

  // --- ADMIN APIs ---

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async findAll() {
    const messages = await this.contactService.findAll();
    return { data: messages };
  }

  @Get('unread-count')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getUnreadCount() {
    return this.contactService.getUnreadCount();
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateContactStatusDto
  ) {
    const message = await this.contactService.updateStatus(id, dto.status);
    return { message: 'Status updated', data: message };
  }

  @Patch(':id/read')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async markAsRead(@Param('id') id: string) {
    const message = await this.contactService.markAsRead(id);
    return { message: 'Message marked as read', data: message };
  }

  @Patch(':id/unread')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async markAsUnread(@Param('id') id: string) {
    const message = await this.contactService.markAsUnread(id);
    return { message: 'Message marked as unread', data: message };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    await this.contactService.remove(id);
    return { message: 'Message deleted successfully' };
  }
}
