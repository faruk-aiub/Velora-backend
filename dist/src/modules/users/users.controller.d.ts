import type { Request } from 'express';
import { UsersService } from './users.service';
import { UpdateProfileDto, CreateAddressDto, UpdateAddressDto } from './dto/user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: Request): Promise<{
        data: {
            email: string;
            id: string;
            role: import("@prisma/client").$Enums.Role;
            is_email_verified: boolean;
            profile: {
                first_name: string;
                last_name: string;
                id: string;
                created_at: Date;
                updated_at: Date;
                phone: string | null;
                avatar_url: string | null;
                user_id: string;
            } | null;
            addresses: {
                type: import("@prisma/client").$Enums.AddressType;
                id: string;
                created_at: Date;
                updated_at: Date;
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
            first_name: string;
            last_name: string;
            id: string;
            created_at: Date;
            updated_at: Date;
            phone: string | null;
            avatar_url: string | null;
            user_id: string;
        };
    }>;
    addAddress(req: Request, addressDto: CreateAddressDto): Promise<{
        message: string;
        data: {
            type: import("@prisma/client").$Enums.AddressType;
            id: string;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            address_line1: string;
            city: string;
            postal_code: string;
            is_default: boolean;
        };
    }>;
    getAddresses(req: Request): Promise<{
        data: {
            type: import("@prisma/client").$Enums.AddressType;
            id: string;
            created_at: Date;
            updated_at: Date;
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
            type: import("@prisma/client").$Enums.AddressType;
            id: string;
            created_at: Date;
            updated_at: Date;
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
        email: string;
        id: string;
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
                first_name: string;
                last_name: string;
                id: string;
                created_at: Date;
                updated_at: Date;
                phone: string | null;
                avatar_url: string | null;
                user_id: string;
            } | null;
            addresses: {
                type: import("@prisma/client").$Enums.AddressType;
                id: string;
                created_at: Date;
                updated_at: Date;
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
            email: string;
            id: string;
            provider_id: string | null;
            reset_token: string | null;
            verification_token: string | null;
            password_hash: string | null;
            auth_provider: import("@prisma/client").$Enums.AuthProvider;
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
        };
    }>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
}
