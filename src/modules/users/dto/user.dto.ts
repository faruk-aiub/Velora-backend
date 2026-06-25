import { IsString, IsOptional, IsEnum, IsBoolean, IsNotEmpty } from 'class-validator';
import { AddressType } from '@prisma/client';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;
}

export class CreateAddressDto {
  @IsEnum(AddressType)
  type: AddressType;

  @IsNotEmpty()
  @IsString()
  address_line1: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  postal_code: string;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}

export class UpdateAddressDto {
  @IsOptional()
  @IsEnum(AddressType)
  type?: AddressType;

  @IsOptional()
  @IsString()
  address_line1?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  postal_code?: string;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @IsNotEmpty()
  @IsString()
  newPassword: string;
}
