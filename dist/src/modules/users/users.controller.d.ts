import type { Request } from 'express';
import { UsersService } from './users.service';
import { UpdateProfileDto, CreateAddressDto, UpdateAddressDto, ChangePasswordDto } from './dto/user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: Request): Promise<{
        data: {
            first_name: string;
            last_name: string;
            avatar_url: string | null;
            phone: string | null;
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
            is_email_verified: boolean;
            addresses: {
                id: string;
                created_at: Date;
                updated_at: Date;
                user_id: string;
                type: import("@prisma/client").$Enums.AddressType;
                address_line1: string;
                city: string;
                postal_code: string;
                is_default: boolean;
            }[];
        };
    }>;
    updateProfile(req: Request, updateDto: UpdateProfileDto): Promise<{
        message: string;
        data: {
            id: string;
            created_at: Date;
            updated_at: Date;
            first_name: string;
            last_name: string;
            phone: string | null;
            avatar_url: string | null;
            user_id: string;
        };
    }>;
    changePassword(req: Request, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    addAddress(req: Request, addressDto: CreateAddressDto): Promise<{
        message: string;
        data: {
            id: string;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            type: import("@prisma/client").$Enums.AddressType;
            address_line1: string;
            city: string;
            postal_code: string;
            is_default: boolean;
        };
    }>;
    getAddresses(req: Request): Promise<{
        data: {
            id: string;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            type: import("@prisma/client").$Enums.AddressType;
            address_line1: string;
            city: string;
            postal_code: string;
            is_default: boolean;
        }[];
    }>;
    updateAddress(req: Request, id: string, addressDto: UpdateAddressDto): Promise<{
        message: string;
        data: {
            id: string;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            type: import("@prisma/client").$Enums.AddressType;
            address_line1: string;
            city: string;
            postal_code: string;
            is_default: boolean;
        };
    }>;
    deleteAddress(req: Request, id: string): Promise<{
        message: string;
    }>;
    getAllUsers(page?: string, limit?: string): Promise<import("../../common/utils/pagination.util").PaginatedResponse<{
        id: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        is_active: boolean;
        created_at: Date;
        profile: {
            first_name: string;
            last_name: string;
        } | null;
    }>>;
    getUserById(id: string): Promise<{
        data: {
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
            addresses: {
                id: string;
                created_at: Date;
                updated_at: Date;
                user_id: string;
                type: import("@prisma/client").$Enums.AddressType;
                address_line1: string;
                city: string;
                postal_code: string;
                is_default: boolean;
            }[];
            login_history: {
                id: string;
                user_id: string;
                ip_address: string | null;
                device_info: string | null;
                browser: string | null;
                login_time: Date;
            }[];
        } & {
            id: string;
            email: string;
            password_hash: string | null;
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
    deleteUser(id: string): Promise<{
        message: string;
    }>;
}
