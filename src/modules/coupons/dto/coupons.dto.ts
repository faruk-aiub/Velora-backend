import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, IsDateString } from 'class-validator';

export enum DiscountTypeEnum {
  PERCENT = 'PERCENT',
  FIXED = 'FIXED'
}

export class CreateCouponDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsEnum(DiscountTypeEnum)
  discount_type: DiscountTypeEnum;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  discount_value: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  min_order_value?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  usage_limit?: number;

  @IsOptional()
  @IsDateString()
  expires_at?: string;
}

export class ValidateCouponDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  cart_total: number;
}
