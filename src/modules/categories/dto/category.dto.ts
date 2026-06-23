import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Smartphones' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ required: false, description: 'Leave empty for root categories' })
  @IsOptional()
  @IsString()
  parent_id?: string;

  @ApiProperty({ required: false, example: 'https://example.com/smartphone.png' })
  @IsOptional()
  @IsString()
  image_url?: string;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  parent_id?: string;

  @IsOptional()
  @IsString()
  image_url?: string;
}
