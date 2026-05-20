import { Transform, Type } from 'class-transformer';
import {
  IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min,
} from 'class-validator';
import { Rank } from '@closdex/db';

export class SearchTalentDto {
  @IsOptional()
  @IsEnum(Rank)
  minRank?: Rank;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPoints?: number;

  /** Match salespeople who have attempted ≥1 challenge in this category. */
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minExperienceYears?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  openToWork?: boolean;

  /** Match if salesperson has any of the requested tags. */
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsString({ each: true })
  specializationTags?: string[];

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
