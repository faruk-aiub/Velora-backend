import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto } from './dto/auth.dto';
import type { Request, Response } from 'express';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        data: {
            first_name: string;
            last_name: string;
            avatar_url: string | null;
            phone: string | null;
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
            reset_token_expires: Date | null;
            verification_expires: Date | null;
            two_factor_secret: string | null;
            is_two_factor_enabled: boolean;
        };
    }>;
    login(loginDto: LoginDto, request: Request, response: Response): Promise<{
        message: string;
        data: {
            accessToken: string;
            user: {
                first_name: string;
                last_name: string;
                avatar_url: string | null;
                phone: string | null;
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
                reset_token_expires: Date | null;
                verification_expires: Date | null;
                two_factor_secret: string | null;
                is_two_factor_enabled: boolean;
            };
        };
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    logout(): Promise<{
        message: string;
    }>;
    getProfile(request: Request): Promise<{
        data: Express.User | undefined;
    }>;
}
