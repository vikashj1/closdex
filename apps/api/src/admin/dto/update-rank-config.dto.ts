import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateRankConfigDto {
  @IsOptional() @IsInt() @Min(0)
  minPoints?: number;

  /** Null = unbounded (use for Grandmaster). Omit to leave unchanged. */
  @IsOptional() @IsInt() @Min(0)
  maxPoints?: number | null;

  @IsOptional() @IsString()
  privileges?: string;
}
