"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const argon2 = __importStar(require("argon2"));
const crypto = __importStar(require("crypto"));
const mail_service_1 = require("../mail/mail.service");
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    mailService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, jwtService, mailService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.mailService = mailService;
    }
    async register(registerDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: registerDto.email }
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email is already registered');
        }
        const passwordHash = await argon2.hash(registerDto.password);
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
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
    async verifyEmail(dto) {
        const user = await this.prisma.user.findUnique({ where: { verification_token: dto.token } });
        if (!user || !user.verification_expires || user.verification_expires < new Date()) {
            throw new common_1.BadRequestException('Invalid or expired verification token');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { is_email_verified: true, verification_token: null, verification_expires: null }
        });
        return true;
    }
    async login(loginDto, ipAddress, userAgent) {
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email },
            include: { profile: true }
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.locked_until && user.locked_until > new Date()) {
            throw new common_1.UnauthorizedException(`Account locked until ${user.locked_until.toISOString()}`);
        }
        if (!user.is_active) {
            throw new common_1.UnauthorizedException('Account is disabled');
        }
        if (!user.password_hash) {
            throw new common_1.UnauthorizedException('Please login with your social account');
        }
        const isPasswordValid = await argon2.verify(user.password_hash, loginDto.password);
        if (!isPasswordValid) {
            await this.handleFailedLogin(user.id, user.failed_login_attempts);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { failed_login_attempts: 0, locked_until: null }
        });
        await Promise.all([
            this.prisma.session.create({
                data: { user_id: user.id, ip_address: ipAddress, user_agent: userAgent }
            }),
            this.prisma.loginHistory.create({
                data: { user_id: user.id, ip_address: ipAddress, browser: userAgent }
            })
        ]);
        const tokens = await this.generateTokens(user.id, user.role);
        const { password_hash, verification_token, ...safeUser } = user;
        return { tokens, user: safeUser };
    }
    async handleFailedLogin(userId, currentAttempts) {
        const attempts = currentAttempts + 1;
        let lockedUntil = null;
        if (attempts >= MAX_LOGIN_ATTEMPTS) {
            lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
            this.logger.warn(`Account ${userId} locked due to failed attempts`);
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: { failed_login_attempts: attempts, locked_until: lockedUntil }
        });
    }
    async refreshTokens(oldRefreshToken) {
        try {
            const payload = await this.jwtService.verifyAsync(oldRefreshToken, {
                secret: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key',
            });
            const tokenHash = crypto.createHash('sha256').update(oldRefreshToken).digest('hex');
            const dbToken = await this.prisma.refreshToken.findUnique({ where: { token_hash: tokenHash } });
            if (!dbToken || dbToken.is_revoked || dbToken.expires_at < new Date()) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            await this.prisma.refreshToken.update({
                where: { token_hash: tokenHash },
                data: { is_revoked: true }
            });
            return this.generateTokens(payload.sub, payload.role);
        }
        catch (e) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async googleLogin(profile) {
        if (!profile.emails || !profile.emails.length) {
            throw new common_1.BadRequestException('Google account must have an email');
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
            });
        }
        else {
            if (!user.is_active) {
                throw new common_1.UnauthorizedException('Account is disabled');
            }
            if (user.auth_provider === 'LOCAL' && !user.provider_id) {
                await this.prisma.user.update({
                    where: { id: user.id },
                    data: { auth_provider: 'GOOGLE', provider_id: profile.id, is_email_verified: true }
                });
            }
        }
        return this.generateTokens(user.id, user.role);
    }
    async generateTokens(userId, role) {
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
    async forgotPassword(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user)
            return true;
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { reset_token: hashedToken, reset_token_expires: resetExpires }
        });
        await this.mailService.sendPasswordResetEmail(user.email, resetToken);
        return true;
    }
    async resetPassword(dto) {
        const hashedToken = crypto.createHash('sha256').update(dto.token).digest('hex');
        const user = await this.prisma.user.findUnique({ where: { reset_token: hashedToken } });
        if (!user || !user.reset_token_expires || user.reset_token_expires < new Date()) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
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
        await this.prisma.refreshToken.updateMany({
            where: { user_id: user.id, is_revoked: false },
            data: { is_revoked: true }
        });
        return true;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map