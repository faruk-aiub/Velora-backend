import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class UpdateStockDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;
}

export class SetStockDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantity: number;
}
