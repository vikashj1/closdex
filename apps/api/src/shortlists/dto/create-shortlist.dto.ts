import { IsString, MinLength } from 'class-validator';

export class CreateShortlistDto {
  @IsString()
  companyId!: string;

  @IsString()
  @MinLength(2)
  name!: string;
}
