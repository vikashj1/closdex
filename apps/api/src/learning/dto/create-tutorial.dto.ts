import { IsEnum, IsInt, IsOptional, IsString, IsUrl, Min, MinLength } from 'class-validator';
import { TutorialType } from '@closdex/db';

export class CreateTutorialDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsEnum(TutorialType)
  type!: TutorialType;

  /** Video tutorials need contentUrl; articles need body. Cross-field check in service. */
  @IsOptional()
  @IsString()
  @IsUrl()
  contentUrl?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  body?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
