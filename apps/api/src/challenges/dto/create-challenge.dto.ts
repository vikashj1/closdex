import { IsEnum, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { DifficultyTier, GoalType } from '@closdex/db';

export class CreateChallengeDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  @MinLength(10)
  brief!: string;

  @IsString()
  category!: string;

  @IsEnum(DifficultyTier)
  difficulty!: DifficultyTier;

  @IsEnum(GoalType)
  goalType!: GoalType;

  @IsString()
  goalDescription!: string;

  @IsInt()
  @Min(1)
  basePoints!: number;

  @IsInt()
  @Min(1)
  maxMessages!: number;

  @IsInt()
  @Min(1)
  estimatedMinutes!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  attemptsAllowed?: number;

  @IsString()
  personaId!: string;
}
