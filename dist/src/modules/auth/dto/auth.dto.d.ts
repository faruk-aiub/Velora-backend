export declare class RegisterDto {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    new_password: string;
}
export declare class VerifyEmailDto {
    token: string;
}
