import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto } from './dto/auth.dto';
import { MailService } from '../mail/mail.service';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly mailService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, mailService: MailService);
    register(registerDto: RegisterDto): Promise<{
        email: string;
        id: string;
        role: import("@prisma/client").$Enums.Role;
        is_active: boolean;
    }>;
    verifyEmail(dto: VerifyEmailDto): Promise<boolean>;
    login(loginDto: LoginDto, ipAddress: string, userAgent: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    private handleFailedLogin;
    refreshTokens(oldRefreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    googleLogin(profile: any): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    private generateTokens;
    forgotPassword(dto: ForgotPasswordDto): Promise<boolean>;
    resetPassword(dto: ResetPasswordDto): Promise<boolean>;
}
