import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { LoginDto } from '../auth/dto/auth.dto';

@Injectable()
export class AdminAuthService {
  private readonly logger = new Logger(AdminAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto, ip: string, userAgent: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user || user.role !== 'ADMIN') {
      this.logger.warn(`Failed admin login attempt for email: ${loginDto.email} from IP: ${ip}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password_hash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await argon2.verify(user.password_hash, loginDto.password);

    if (!isPasswordValid) {
      // Implement brute-force protection tracking here if needed, in phase 1 we just rely on throttler
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Save login history
    await this.prisma.loginHistory.create({
      data: {
        user_id: user.id,
        ip_address: ip,
        browser: userAgent,
      }
    });

    const { password_hash, ...userWithoutPassword } = user;

    return {
      tokens: { accessToken },
      user: userWithoutPassword,
    };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== 'ADMIN') {
      throw new UnauthorizedException('Invalid user');
    }

    if (!user.password_hash) {
      throw new UnauthorizedException('Account cannot change password directly');
    }

    const isPasswordValid = await argon2.verify(user.password_hash, oldPassword);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid old password');
    }

    const hashedNewPassword = await argon2.hash(newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password_hash: hashedNewPassword },
    });

    return { message: 'Password changed successfully' };
  }
}
