import { IsOptional, IsString, MaxLength } from 'class-validator';

export class QuarantineReviewDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
