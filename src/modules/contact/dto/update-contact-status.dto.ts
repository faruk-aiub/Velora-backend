import { IsString, IsIn } from 'class-validator';

export class UpdateContactStatusDto {
  @IsString()
  @IsIn(['OPEN', 'PENDING', 'RESOLVED', 'CLOSED'])
  status: string;
}
