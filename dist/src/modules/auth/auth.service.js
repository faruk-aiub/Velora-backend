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
const argon2 = __importStar(require("argon2"));
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async register(registerDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: registerDto.email },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('Email is already in use');
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
        const { password_hash, verification_token, reset_token, profile, ...safeUser } = user;
        return {
            ...safeUser,
            first_name: profile?.first_name || '',
            last_name: profile?.last_name || '',
            avatar_url: profile?.avatar_url || null,
            phone: profile?.phone || null,
        };
    }
    async login(loginDto, ipAddress, userAgent) {
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email },
            include: { profile: true },
        });
        if (!user || !user.password_hash) {
            this.logger.warn(`Failed login attempt for email: ${loginDto.email} from IP: ${ipAddress}`);
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (!user.is_active) {
            throw new common_1.UnauthorizedException('Account is disabled');
        }
        const isPasswordValid = await argon2.verify(user.password_hash, loginDto.password);
        if (!isPasswordValid) {
            this.logger.warn(`Failed login attempt (wrong password) for email: ${loginDto.email} from IP: ${ipAddress}`);
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        Promise.all([
            this.prisma.session.create({
                data: { user_id: user.id, ip_address: ipAddress, user_agent: userAgent },
            }),
            this.prisma.loginHistory.create({
                data: { user_id: user.id, ip_address: ipAddress, browser: userAgent },
            }),
        ]).catch(err => this.logger.error('Failed to save login history', err));
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
            },
        };
    }
    async forgotPassword(forgotPasswordDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: forgotPasswordDto.email },
        });
        if (!user) {
            return { message: 'If an account exists, a reset link has been sent.' };
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date(Date.now() + 1000 * 60 * 60);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                reset_token: resetToken,
                reset_token_expires: tokenExpires,
            },
        });
        this.logger.log(`Password reset token for ${user.email}: ${resetToken}`);
        return { message: 'If an account exists, a reset link has been sent.' };
    }
    async generateTokens(userId, role) {
        const payload = { sub: userId, role };
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_SECRET || 'super-secret-jwt-key',
            expiresIn: '7d'
        });
        return { accessToken };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map