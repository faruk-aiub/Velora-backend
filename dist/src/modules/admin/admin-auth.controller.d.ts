import { AdminAuthService } from './admin-auth.service';
import { LoginDto } from '../auth/dto/auth.dto';
import type { Request, Response } from 'express';
import { AdminChangePasswordDto } from './dto/admin-auth.dto';
export declare class AdminAuthController {
    private readonly adminAuthService;
    constructor(adminAuthService: AdminAuthService);
    login(loginDto: LoginDto, request: Request, response: Response): Promise<{
        message: string;
        data: {
            accessToken: string;
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
        };
    }>;
    logout(response: Response): Promise<{
        message: string;
    }>;
    changePassword(changePasswordDto: AdminChangePasswordDto, request: Request): Promise<{
        message: string;
    }>;
}
