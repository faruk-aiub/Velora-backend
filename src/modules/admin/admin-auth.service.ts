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
    const accessToken = this.jwtService.sign(payload);
    
    // Create refresh token
    const refreshTokenPayload = { sub: user.id, type: 'refresh' };
    const refreshTokenString = this.jwtService.sign(refreshTokenPayload, { expiresIn: '7d' });
    
    // Hash refresh token to store in db
    const hashedRefreshToken = await argon2.hash(refreshTokenString);
    
    await this.prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token_hash: hashedRefreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      }
    });

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
      tokens: { accessToken, refreshToken: refreshTokenString },
      user: userWithoutPassword,
    };
  }
}
