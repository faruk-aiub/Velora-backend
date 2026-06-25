import { AddressType } from '@prisma/client';
export declare class UpdateProfileDto {
    first_name?: string;
    last_name?: string;
    phone?: string;
    avatar_url?: string;
}
export declare class CreateAddressDto {
    type: AddressType;
    address_line1: string;
    city: string;
    postal_code: string;
    is_default?: boolean;
}
export declare class UpdateAddressDto {
    type?: AddressType;
    address_line1?: string;
    city?: string;
    postal_code?: string;
    is_default?: boolean;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
