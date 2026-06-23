import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'test@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsString()
  first_name: string;

  @IsString()
  last_name: string;
}

export class LoginDto {
  @ApiProperty({ example: 'test@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'test@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'abc123tokenXYZ' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'newpassword123' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  new_password: string;
}

export class VerifyEmailDto {
  @ApiProperty({ example: 'abc123tokenXYZ' })
  @IsString()
  token: string;
}
