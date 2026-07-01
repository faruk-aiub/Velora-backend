import { IsString, IsOptional, IsBoolean, IsNumber, IsObject, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 15 Pro Max' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'The latest titanium iPhone', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '22222222-2222-2222-2222-222222222222', required: false })
  @IsOptional()
  @IsString()
  brand_id?: string;

  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
  @IsNotEmpty()
  @IsString()
  category_id: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({ example: 99.99, required: false })
  @IsOptional()
  @IsNumber()
  base_price?: number;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  brand_id?: string;

  @IsOptional()
  @IsString()
  category_id?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsNumber()
  base_price?: number;
}

export class CreateVariantDto {
  @IsNotEmpty()
  @IsString()
  sku: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  compare_price?: number;

  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;
}

export class UpdateVariantDto {
  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  compare_price?: number;

  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;
}

export class CreateImageDto {
  @ApiProperty({ example: 'https://example.com/images/iphone-15-pro-max.png' })
  @IsNotEmpty()
  @IsString()
  url: string;

  @ApiProperty({ example: 'Front view of iPhone 15 Pro Max', required: false })
  @IsOptional()
  @IsString()
  alt_text?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  sort_order?: number;
}
