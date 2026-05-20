import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateRuleConfigDto {
  @IsNumber()
  value!: number;

  @IsOptional() @IsString()
  note?: string;
}
