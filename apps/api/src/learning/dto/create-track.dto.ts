import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateTrackDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsString()
  category!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
