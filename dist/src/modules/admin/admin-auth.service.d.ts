import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../auth/dto/auth.dto';
export declare class AdminAuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(loginDto: LoginDto, ip: string, userAgent: string): Promise<{
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
        user: {
            id: string;
            email: string;
            auth_provider: import("@prisma/client").$Enums.AuthProvider;
            provider_id: string | null;
            role: import("@prisma/client").$Enums.Role;
            is_email_verified: boolean;
            is_active: boolean;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            failed_login_attempts: number;
            locked_until: Date | null;
            reset_token: string | null;
            reset_token_expires: Date | null;
            verification_token: string | null;
            verification_expires: Date | null;
            two_factor_secret: string | null;
            is_two_factor_enabled: boolean;
        };
    }>;
    changePassword(userId: string, oldPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
}
