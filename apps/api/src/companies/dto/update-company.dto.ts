import { IsArray, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

/** Company profile fields editable by a company ADMIN member. Verification status
 *  is intentionally NOT here — that's a moderation action on the admin/CMS side. */
export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  locations?: string[];

  @IsOptional()
  @IsString()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  about?: string;

  @IsOptional()
  @IsString()
  perks?: string;

  @IsOptional()
  @IsString()
  culture?: string;

  @IsOptional()
  @IsString()
  incentiveStructure?: string;

  @IsOptional()
  @IsString()
  gstin?: string;

  @IsOptional()
  @IsString()
  pan?: string;
}
