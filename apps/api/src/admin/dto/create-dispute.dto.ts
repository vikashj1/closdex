import { IsString, MinLength } from 'class-validator';

export class CreateDisputeDto {
  @IsString()
  attemptId!: string;

  @IsString()
  @MinLength(10)
  reason!: string;
}
