import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto } from './dto/auth.dto';
import type { Request, Response } from 'express';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        data: {
            email: string;
            id: string;
            role: import("@prisma/client").$Enums.Role;
            is_active: boolean;
        };
    }>;
    login(loginDto: LoginDto, request: Request, response: Response): Promise<{
        message: string;
        data: {
            accessToken: string;
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
