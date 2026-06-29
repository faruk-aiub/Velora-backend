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
const crypto = __importStar(require("crypto"));
const firebase_config_1 = require("../../config/firebase.config");
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async firebaseLogin(idToken, ipAddress, userAgent) {
        let decodedToken;
        try {
            decodedToken = await firebase_config_1.firebaseAuth.verifyIdToken(idToken);
        }
        catch (error) {
            this.logger.error('Firebase token verification failed', error);
            throw new common_1.UnauthorizedException('Invalid Firebase ID token');
        }
        const { email, uid, email_verified, name, picture } = decodedToken;
        if (!email) {
            throw new common_1.UnauthorizedException('Firebase account must have an email');
        }
        if (!email_verified) {
            throw new common_1.UnauthorizedException('Please verify your email address before logging in');
        }
        let user = await this.prisma.user.findUnique({
            where: { email },
            include: { profile: true }
        });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email,
                    auth_provider: 'GOOGLE',
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
        }
        else {
            if (!user.is_active) {
                throw new common_1.UnauthorizedException('Account is disabled');
            }
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
        await Promise.all([
            this.prisma.session.create({
                data: { user_id: user.id, ip_address: ipAddress, user_agent: userAgent }
            }),
            this.prisma.loginHistory.create({
                data: { user_id: user.id, ip_address: ipAddress, browser: userAgent }
            })
        ]);
        const tokens = await this.generateTokens(user.id, user.role);
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map