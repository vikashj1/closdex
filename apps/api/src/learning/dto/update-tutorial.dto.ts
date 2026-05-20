import { IsEnum, IsInt, IsOptional, IsString, IsUrl, Min, MinLength } from 'class-validator';
import { TutorialType } from '@closdex/db';

export class UpdateTutorialDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @IsOptional()
  @IsEnum(TutorialType)
  type?: TutorialType;

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
