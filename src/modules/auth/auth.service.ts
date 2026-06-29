import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { firebaseAuth } from '../../config/firebase.config';
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async firebaseLogin(idToken: string, ipAddress: string, userAgent: string) {
    let decodedToken;
    try {
      decodedToken = await firebaseAuth.verifyIdToken(idToken);
    } catch (error) {
      this.logger.error('Firebase token verification failed', error);
      throw new UnauthorizedException('Invalid Firebase ID token');
    }

    const { email, uid, email_verified, name, picture } = decodedToken;

    if (!email) {
      throw new UnauthorizedException('Firebase account must have an email');
    }

    // Require email verification (Firebase enforces this based on whether it's an email/password account or social)
    // Note: Google social logins usually come back with email_verified = true automatically.
    if (!email_verified) {
      throw new UnauthorizedException('Please verify your email address before logging in');
    }

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          auth_provider: 'GOOGLE', // Sticking with this to signify external Auth provider for now
          provider_id: uid,
          is_email_verified: true,
          profile: {
            create: {
              first_name: name ? name.split(' ')[0] : 'User',
              last_name: name ? name.split(' ').slice(1).join(' ') : '',
              avatar_url: picture || null,
            }
          }
        },
        include: { profile: true }
      });
    } else {
      if (!user.is_active) {
        throw new UnauthorizedException('Account is disabled');
      }
      
      // If they were a legacy LOCAL user, upgrade them to FIREBASE/GOOGLE
      if (user.auth_provider === 'LOCAL' || user.provider_id !== uid) {
         user = await this.prisma.user.update({
            where: { id: user.id },
            data: { 
              auth_provider: 'GOOGLE', 
              provider_id: uid, 
              is_email_verified: true 
            },
            include: { profile: true }
         });
      }
    }

    // Create session and history
    await Promise.all([
      this.prisma.session.create({
        data: { user_id: user.id, ip_address: ipAddress, user_agent: userAgent }
      }),
      this.prisma.loginHistory.create({
        data: { user_id: user.id, ip_address: ipAddress, browser: userAgent }
      })
    ]);

    const tokens = await this.generateTokens(user.id, user.role);
    
    // Omit sensitive data before returning
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, verification_token, reset_token, profile, ...safeUser } = user;
    
    return { 
      tokens, 
      user: {
        ...safeUser,
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
        avatar_url: profile?.avatar_url || null,
        phone: profile?.phone || null,
      } 
    };
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
}
