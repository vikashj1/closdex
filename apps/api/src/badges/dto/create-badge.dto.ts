import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateBadgeDto {
  @IsString()
  @MinLength(2)
  code!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  iconUrl?: string;
}
