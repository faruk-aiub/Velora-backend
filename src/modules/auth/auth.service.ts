import { Injectable, UnauthorizedException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto } from './dto/auth.dto';
import { MailService } from '../mail/mail.service';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email }
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await argon2.hash(registerDto.password);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password_hash: passwordHash,
        verification_token: verificationToken,
        verification_expires: verificationExpires,
        profile: {
          create: {
            first_name: registerDto.first_name,
            last_name: registerDto.last_name,
          }
        }
      },
      select: { id: true, email: true, role: true, is_active: true }
    });

    await this.mailService.sendVerificationEmail(user.email, verificationToken);
    return user;
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.prisma.user.findUnique({ where: { verification_token: dto.token } });
    if (!user || !user.verification_expires || user.verification_expires < new Date()) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { is_email_verified: true, verification_token: null, verification_expires: null }
    });
    return true;
  }

  async login(loginDto: LoginDto, ipAddress: string, userAgent: string) {
    const user = await this.prisma.user.findUnique({ where: { email: loginDto.email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.is_email_verified) {
      throw new UnauthorizedException('Please verify your email address before logging in');
    }

    // Check Lock
    if (user.locked_until && user.locked_until > new Date()) {
      throw new UnauthorizedException(`Account locked until ${user.locked_until.toISOString()}`);
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account is disabled');
    }

    if (!user.password_hash) {
      throw new UnauthorizedException('Please login with your social account');
    }

    const isPasswordValid = await argon2.verify(user.password_hash, loginDto.password);
    
    if (!isPasswordValid) {
      await this.handleFailedLogin(user.id, user.failed_login_attempts);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset lock and update tracking
    await this.prisma.user.update({
      where: { id: user.id },
      data: { failed_login_attempts: 0, locked_until: null }
    });

    // Create session and history
    await Promise.all([
      this.prisma.session.create({
        data: { user_id: user.id, ip_address: ipAddress, user_agent: userAgent }
      }),
      this.prisma.loginHistory.create({
        data: { user_id: user.id, ip_address: ipAddress, browser: userAgent }
      })
    ]);

    return this.generateTokens(user.id, user.role);
  }

  private async handleFailedLogin(userId: string, currentAttempts: number) {
    const attempts = currentAttempts + 1;
    let lockedUntil: Date | null = null;
    
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
      this.logger.warn(`Account ${userId} locked due to failed attempts`);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { failed_login_attempts: attempts, locked_until: lockedUntil }
    });
  }

  async refreshTokens(oldRefreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(oldRefreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key',
      });

      // Verify token in DB is not revoked
      const tokenHash = crypto.createHash('sha256').update(oldRefreshToken).digest('hex');
      const dbToken = await this.prisma.refreshToken.findUnique({ where: { token_hash: tokenHash } });

      if (!dbToken || dbToken.is_revoked || dbToken.expires_at < new Date()) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Revoke old token
      await this.prisma.refreshToken.update({
        where: { token_hash: tokenHash },
        data: { is_revoked: true }
      });

      return this.generateTokens(payload.sub, payload.role);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async googleLogin(profile: any) {
    if (!profile.emails || !profile.emails.length) {
      throw new BadRequestException('Google account must have an email');
    }
    
    const email = profile.emails[0].value;
    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          auth_provider: 'GOOGLE',
          provider_id: profile.id,
          is_email_verified: true,
          profile: {
            create: {
              first_name: profile.name?.givenName || 'Google',
              last_name: profile.name?.familyName || 'User',
              avatar_url: profile.photos?.[0]?.value || null,
            }
          }
        }
      }) as any;
    } else {
      if (!user.is_active) {
         throw new UnauthorizedException('Account is disabled');
      }
      if (user.auth_provider === 'LOCAL' && !user.provider_id) {
         await this.prisma.user.update({
            where: { id: user.id },
            data: { auth_provider: 'GOOGLE', provider_id: profile.id, is_email_verified: true }
         });
      }
    }

    return this.generateTokens(user!.id, user!.role);
  }

  private async generateTokens(userId: string, role: string) {
    const payload = { sub: userId, role };
    
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET || 'super-secret-jwt-key',
        expiresIn: '15m'
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key',
        expiresIn: '7d'
      })
    ]);

    // Store refresh token in DB
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await this.prisma.refreshToken.create({
      data: {
        user_id: userId,
        token_hash: tokenHash,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    return { accessToken, refreshToken };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) return true; // Don't leak existence

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hr

    await this.prisma.user.update({
      where: { id: user.id },
      data: { reset_token: hashedToken, reset_token_expires: resetExpires }
    });

    await this.mailService.sendPasswordResetEmail(user.email, resetToken);
    return true;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const hashedToken = crypto.createHash('sha256').update(dto.token).digest('hex');
    const user = await this.prisma.user.findUnique({ where: { reset_token: hashedToken } });

    if (!user || !user.reset_token_expires || user.reset_token_expires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await argon2.hash(dto.new_password);
    
    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        password_hash: passwordHash, 
        reset_token: null, 
        reset_token_expires: null,
        failed_login_attempts: 0,
        locked_until: null
      }
    });

    // Optional: Revoke all existing refresh tokens here
    await this.prisma.refreshToken.updateMany({
      where: { user_id: user.id, is_revoked: false },
      data: { is_revoked: true }
    });

    return true;
  }
}
