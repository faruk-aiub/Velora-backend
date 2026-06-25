import type { Request } from 'express';
import { UsersService } from './users.service';
import { UpdateProfileDto, CreateAddressDto, UpdateAddressDto, ChangePasswordDto } from './dto/user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: Request): Promise<{
        data: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
            is_email_verified: boolean;
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
                type: import("@prisma/client").$Enums.AddressType;
                user_id: string;
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
            type: import("@prisma/client").$Enums.AddressType;
            user_id: string;
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
            type: import("@prisma/client").$Enums.AddressType;
            user_id: string;
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
            type: import("@prisma/client").$Enums.AddressType;
            user_id: string;
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
        created_at: Date;
        is_active: boolean;
        email: string;
        role: import("@prisma/client").$Enums.Role;
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
                type: import("@prisma/client").$Enums.AddressType;
                user_id: string;
                address_line1: string;
                city: string;
                postal_code: string;
                is_default: boolean;
            }[];
            login_history: {
                id: string;
                ip_address: string | null;
                user_id: string;
                device_info: string | null;
                browser: string | null;
                login_time: Date;
            }[];
        } & {
            id: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            is_active: boolean;
            email: string;
            provider_id: string | null;
            reset_token: string | null;
            verification_token: string | null;
            password_hash: string | null;
            auth_provider: import("@prisma/client").$Enums.AuthProvider;
            role: import("@prisma/client").$Enums.Role;
            is_email_verified: boolean;
            failed_login_attempts: number;
            locked_until: Date | null;
            reset_token_expires: Date | null;
            verification_expires: Date | null;
        };
    }>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
}
