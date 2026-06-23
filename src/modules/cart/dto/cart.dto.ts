import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ example: '3c8eb30a-a1ae-4396-9fa6-f0286ddb71e9' })
  @IsNotEmpty()
  @IsString()
  variant_id: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class UpdateCartItemDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
}
