import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateGoalConfigDto {
  @IsOptional() @IsString()
  label?: string;

  @IsOptional() @IsNumber() @Min(0.1)
  multiplier?: number;
}
