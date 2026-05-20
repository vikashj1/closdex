import {
  ArrayMinSize, IsArray, IsDateString, IsEnum, IsInt, IsOptional, IsString, Min, MinLength,
} from 'class-validator';
import { EmploymentType, ListingTier, Rank } from '@closdex/db';

export class CreateJobDto {
  @IsString()
  companyId!: string;

  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  requiredSkills!: string[];

  @IsString()
  specializationTag!: string;

  @IsInt()
  @Min(0)
  experienceMinYears!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  experienceMaxYears?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMax?: number;

  @IsString()
  location!: string;

  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @IsOptional()
  @IsEnum(Rank)
  minRank?: Rank;

  @IsOptional()
  @IsEnum(ListingTier)
  listingTier?: ListingTier;

  /** ISO date string. Past dates are accepted at create time (admin can backfill). */
  @IsOptional()
  @IsDateString()
  applicationDeadline?: string;
}
