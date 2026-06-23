import { IsEnum, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PaymentProviderEnum {
  BKASH = 'BKASH',
  NAGAD = 'NAGAD',
  COD = 'COD'
}

export enum PaymentStatusEnum {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export class InitiatePaymentDto {
  @ApiProperty({ example: 'd3f6a2b8-9e1c-4b3a-8f5d-7e2c1a4b9f6c' })
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @ApiProperty({ example: 'BKASH', enum: PaymentProviderEnum })
  @IsEnum(PaymentProviderEnum)
  provider: PaymentProviderEnum;
}

export class VerifyPaymentDto {
  @IsNotEmpty()
  @IsString()
  paymentId: string;

  @IsEnum(PaymentStatusEnum)
  status: PaymentStatusEnum;

  @IsOptional()
  @IsString()
  transactionId?: string;
}
