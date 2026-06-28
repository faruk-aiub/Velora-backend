import { PrismaService } from '../../database/prisma.service';
import { UpdateProfileDto, CreateAddressDto, UpdateAddressDto, ChangePasswordDto } from './dto/user.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
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
            type: import("@prisma/client").$Enums.AddressType;
            user_id: string;
            address_line1: string;
            city: string;
            postal_code: string;
            is_default: boolean;
        }[];
    }>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        first_name: string;
        last_name: string;
        phone: string | null;
        avatar_url: string | null;
        user_id: string;
    }>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    getAddresses(userId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        type: import("@prisma/client").$Enums.AddressType;
        user_id: string;
        address_line1: string;
        city: string;
        postal_code: string;
        is_default: boolean;
    }[]>;
    addAddress(userId: string, dto: CreateAddressDto): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        type: import("@prisma/client").$Enums.AddressType;
        user_id: string;
        address_line1: string;
        city: string;
        postal_code: string;
        is_default: boolean;
    }>;
    updateAddress(userId: string, addressId: string, dto: UpdateAddressDto): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        type: import("@prisma/client").$Enums.AddressType;
        user_id: string;
        address_line1: string;
        city: string;
        postal_code: string;
        is_default: boolean;
    }>;
    deleteAddress(userId: string, addressId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        type: import("@prisma/client").$Enums.AddressType;
        user_id: string;
        address_line1: string;
        city: string;
        postal_code: string;
        is_default: boolean;
    }>;
    getAllUsers(page?: number, limit?: number): Promise<import("../../common/utils/pagination.util").PaginatedResponse<{
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
            user_id: string;
            ip_address: string | null;
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
    }>;
    deleteUser(id: string): Promise<{
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
    }>;
}
