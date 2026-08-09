import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';
import { RegisterDto, LoginDto, ForgotPasswordDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email is already in use');
    }

    const passwordHash = await argon2.hash(registerDto.password, { type: argon2.argon2id, memoryCost: 4096, timeCost: 2 });

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password_hash: passwordHash,
        auth_provider: 'LOCAL',
        profile: {
          create: {
            first_name: registerDto.first_name,
            last_name: registerDto.last_name,
          },
        },
      },
      include: { profile: true },
    });

    // Omit sensitive data
    const { password_hash, verification_token, reset_token, profile, ...safeUser } = user;

    return {
      ...safeUser,
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      avatar_url: profile?.avatar_url || null,
      phone: profile?.phone || null,
    };
  }

  async login(loginDto: LoginDto, ipAddress: string, userAgent: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: { profile: true },
    });

    if (!user || !user.password_hash) {
      this.logger.warn(`Failed login attempt for email: ${loginDto.email} from IP: ${ipAddress}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account is disabled');
    }

    const isPasswordValid = await argon2.verify(user.password_hash, loginDto.password);
    if (!isPasswordValid) {
      this.logger.warn(`Failed login attempt (wrong password) for email: ${loginDto.email} from IP: ${ipAddress}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Save session & login history in the background (no await to speed up response)
    Promise.all([
      this.prisma.session.create({
        data: { user_id: user.id, ip_address: ipAddress, user_agent: userAgent },
      }),
      this.prisma.loginHistory.create({
        data: { user_id: user.id, ip_address: ipAddress, browser: userAgent },
      }),
    ]).catch(err => this.logger.error('Failed to save login history', err));

    const tokens = await this.generateTokens(user.id, user.role);

    // Omit sensitive data
    const { password_hash, verification_token, reset_token, profile, ...safeUser } = user;

    return {
      tokens,
      user: {
        ...safeUser,
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
        avatar_url: profile?.avatar_url || null,
        phone: profile?.phone || null,
      },
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      // Return success anyway to prevent email enumeration
      return { message: 'If an account exists, a reset link has been sent.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        reset_token: resetToken,
        reset_token_expires: tokenExpires,
      },
    });

    // TODO: Send email using your email service (e.g. Nodemailer)
    // this.emailService.sendPasswordResetEmail(user.email, resetToken);
    this.logger.log(`Password reset token for ${user.email}: ${resetToken}`);

    return { message: 'If an account exists, a reset link has been sent.' };
  }

  private async generateTokens(userId: string, role: string) {
    const payload = { sub: userId, role };
    
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET || 'super-secret-jwt-key',
      expiresIn: '7d' // One way token valid for 7 days
    });

    return { accessToken };
  }
}
