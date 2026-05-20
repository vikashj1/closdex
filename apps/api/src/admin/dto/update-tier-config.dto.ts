import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateTierConfigDto {
  @IsOptional() @IsString()
  color?: string;

  @IsOptional() @IsInt() @Min(1)
  basePoints?: number;

  @IsOptional() @IsString()
  leadBehavior?: string;
}
