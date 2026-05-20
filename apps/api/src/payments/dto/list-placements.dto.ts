import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { PlacementStatus } from '@closdex/db';

export class ListPlacementsDto {
  @IsString()
  companyId!: string;

  @IsOptional()
  @IsEnum(PlacementStatus)
  status?: PlacementStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  perPage?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;
}
