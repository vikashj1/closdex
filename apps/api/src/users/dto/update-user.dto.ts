import { IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

/** Editable fields on the base User record (shared by salespeople and company users). */
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  location?: string;
}
