import { IsOptional, IsString } from 'class-validator';

export class VerificationActionDto {
  @IsOptional() @IsString()
  notes?: string;
}
