import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { ProfileVisibility } from '@closdex/db';

/** Salesperson-only profile fields. Rank and totalPoints are not editable here —
 *  they're derived from challenge performance. */
export class UpdateSalespersonDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  experienceYears?: number;

  @IsOptional()
  @IsString()
  currentCompany?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specializationTags?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  skillSelfAssessment?: number;

  @IsOptional()
  @IsString()
  @IsUrl()
  resumeUrl?: string;

  @IsOptional()
  @IsEnum(ProfileVisibility)
  visibility?: ProfileVisibility;

  @IsOptional()
  @IsBoolean()
  openToWork?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredLocations?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  salaryExpectation?: number;
}
