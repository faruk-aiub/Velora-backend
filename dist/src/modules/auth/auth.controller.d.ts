import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto } from './dto/auth.dto';
import type { Request, Response } from 'express';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        data: {
            id: string;
            is_active: boolean;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
    login(loginDto: LoginDto, request: Request, response: Response): Promise<{
        message: string;
        data: {
            accessToken: string;
            user: {
                profile: {
                    id: string;
                    created_at: Date;
                    updated_at: Date;
                    first_name: string;
                    last_name: string;
                    phone: string | null;
                    avatar_url: string | null;
                    user_id: string;
                } | null;
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
        };
    }>;
    logout(response: Response): Promise<{
        message: string;
    }>;
    refreshToken(request: Request, response: Response): Promise<{
        message: string;
        data: {
            accessToken: string;
        };
    }>;
    getProfile(request: Request): Promise<{
        data: Express.User | undefined;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    verifyEmail(dto: VerifyEmailDto): Promise<{
        message: string;
    }>;
    googleAuth(req: any): Promise<void>;
    googleAuthRedirect(req: any, response: Response): Promise<{
        message: string;
        data: {
            accessToken: string;
        };
    }>;
}
