import {
  ArrayMinSize, IsArray, IsDateString, IsEnum, IsInt, IsOptional, IsString, Min, MinLength,
} from 'class-validator';
import { EmploymentType, ListingTier, Rank } from '@closdex/db';

/** companyId can't be updated (job belongs to the company that created it).
 *  Status transitions go through dedicated routes (publish/pause/close/repost). */
export class UpdateJobDto {
  @IsOptional() @IsString() @MinLength(3)
  title?: string;

  @IsOptional() @IsString() @MinLength(10)
  description?: string;

  @IsOptional() @IsArray() @ArrayMinSize(1) @IsString({ each: true })
  requiredSkills?: string[];

  @IsOptional() @IsString()
  specializationTag?: string;

  @IsOptional() @IsInt() @Min(0)
  experienceMinYears?: number;

  @IsOptional() @IsInt() @Min(0)
  experienceMaxYears?: number;

  @IsOptional() @IsInt() @Min(0)
  salaryMin?: number;

  @IsOptional() @IsInt() @Min(0)
  salaryMax?: number;

  @IsOptional() @IsString()
  location?: string;

  @IsOptional() @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @IsOptional() @IsEnum(Rank)
  minRank?: Rank;

  @IsOptional() @IsEnum(ListingTier)
  listingTier?: ListingTier;

  @IsOptional() @IsDateString()
  applicationDeadline?: string;
}
