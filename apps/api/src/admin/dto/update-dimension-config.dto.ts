import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateDimensionConfigDto {
  @IsOptional() @IsString()
  name?: string;

  /** Fractions across all dimensions should sum to 1.0 — admins are trusted here. */
  @IsOptional() @IsNumber() @Min(0) @Max(1)
  weight?: number;
}
