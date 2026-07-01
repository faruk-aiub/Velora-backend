import { IsString, IsNotEmpty } from 'class-validator';

export class ReplyContactMessageDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}
