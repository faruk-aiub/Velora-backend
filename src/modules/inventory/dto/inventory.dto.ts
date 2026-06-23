import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class UpdateStockDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;
}
