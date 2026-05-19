import { IsEnum, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { DifficultyTier, GoalType } from '@closdex/db';

/** Partial of CreateChallengeDto — status transitions go through dedicated routes
 *  (publish / archive) so we don't allow flipping `status` directly here. */
export class UpdateChallengeDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  brief?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(DifficultyTier)
  difficulty?: DifficultyTier;

  @IsOptional()
  @IsEnum(GoalType)
  goalType?: GoalType;

  @IsOptional()
  @IsString()
  goalDescription?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  basePoints?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxMessages?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  attemptsAllowed?: number;

  @IsOptional()
  @IsString()
  personaId?: string;
}
