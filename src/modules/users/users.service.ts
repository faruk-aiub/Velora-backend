import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateProfileDto, CreateAddressDto, UpdateAddressDto, ChangePasswordDto } from './dto/user.dto';
import { getPaginationParams, createPaginationResponse } from '../../common/utils/pagination.util';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // --- PROFILE MANAGEMENT ---

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        is_email_verified: true,
        profile: true,
        addresses: true,
      }
    });

    if (!user) throw new NotFoundException('User not found');
    
    const { profile, ...safeUser } = user;
    return {
      ...safeUser,
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      avatar_url: profile?.avatar_url || null,
      phone: profile?.phone || null,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.userProfile.upsert({
      where: { user_id: userId },
      update: dto,
      create: {
        user_id: userId,
        first_name: dto.first_name || '',
        last_name: dto.last_name || '',
        phone: dto.phone,
        avatar_url: dto.avatar_url,
      }
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (!user.password_hash) throw new UnauthorizedException('Password change not supported for this account');
    const isMatch = await bcrypt.compare(dto.currentPassword, user.password_hash);
    if (!isMatch) throw new UnauthorizedException('Current password is incorrect');

    const newHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password_hash: newHash },
    });
    return { message: 'Password changed successfully' };
  }

  // --- ADDRESS MANAGEMENT ---

  async getAddresses(userId: string) {
    return this.prisma.userAddress.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });
  }

  async addAddress(userId: string, dto: CreateAddressDto) {
    return this.prisma.$transaction(async (prisma) => {
      // If setting as default, remove default from others
      if (dto.is_default) {
        await prisma.userAddress.updateMany({
          where: { user_id: userId, is_default: true },
          data: { is_default: false }
        });
      }

      // Check if this is their first address
      const count = await prisma.userAddress.count({ where: { user_id: userId } });
      const is_default = count === 0 ? true : dto.is_default;

      return prisma.userAddress.create({
        data: {
          ...dto,
          user_id: userId,
          is_default,
        }
      });
    });
  }

  async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto) {
    const address = await this.prisma.userAddress.findUnique({ where: { id: addressId } });
    if (!address || address.user_id !== userId) {
      throw new NotFoundException('Address not found');
    }

    return this.prisma.$transaction(async (prisma) => {
      if (dto.is_default) {
        await prisma.userAddress.updateMany({
          where: { user_id: userId, is_default: true, id: { not: addressId } },
          data: { is_default: false }
        });
      }

      return prisma.userAddress.update({
        where: { id: addressId },
        data: dto
      });
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.prisma.userAddress.findUnique({ where: { id: addressId } });
    if (!address || address.user_id !== userId) {
      throw new NotFoundException('Address not found');
    }

    return this.prisma.userAddress.delete({ where: { id: addressId } });
  }

  // --- ADMIN APIs ---

  async getAllUsers(page: number = 1, limit: number = 10) {
    const { skip, take } = getPaginationParams(page, limit);
    
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { deleted_at: null },
        skip,
        take,
        select: {
          id: true,
          email: true,
          role: true,
          is_active: true,
          created_at: true,
          profile: {
            select: { first_name: true, last_name: true }
          }
        },
        orderBy: { created_at: 'desc' }
      }),
      this.prisma.user.count({ where: { deleted_at: null } })
    ]);

    return createPaginationResponse(users, total, page, limit);
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        addresses: true,
        login_history: { take: 5, orderBy: { login_time: 'desc' } }
      }
    });

    if (!user || user.deleted_at) throw new NotFoundException('User not found');
    
    // Sanitize
    delete (user as any).password_hash;
    return user;
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    // Soft delete implementation
    return this.prisma.user.update({
      where: { id },
      data: { 
        deleted_at: new Date(),
        is_active: false
      }
    });
  }
}
