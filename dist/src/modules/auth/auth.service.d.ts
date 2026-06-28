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
        first_name: string;
        last_name: string;
        avatar_url: string | null;
        phone: string | null;
        id: string;
        is_active: boolean;
        email: string;
        role: import("@prisma/client").$Enums.Role;
    }>;
    verifyEmail(dto: VerifyEmailDto): Promise<boolean>;
    login(loginDto: LoginDto, ipAddress: string, userAgent: string): Promise<{
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
        user: {
            first_name: string;
            last_name: string;
            avatar_url: string | null;
            phone: string | null;
            id: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            is_active: boolean;
            email: string;
            provider_id: string | null;
            reset_token: string | null;
            auth_provider: import("@prisma/client").$Enums.AuthProvider;
            role: import("@prisma/client").$Enums.Role;
            is_email_verified: boolean;
            failed_login_attempts: number;
            locked_until: Date | null;
            reset_token_expires: Date | null;
            verification_expires: Date | null;
        };
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
