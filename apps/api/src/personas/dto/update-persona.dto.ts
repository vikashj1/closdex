import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdatePersonaDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  contextSnippet?: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  personalityPrompt?: string;
}
