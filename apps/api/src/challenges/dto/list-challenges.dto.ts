import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ChallengeStatus, DifficultyTier, GoalType } from '@closdex/db';

export class ListChallengesDto {
  @IsOptional()
  @IsEnum(DifficultyTier)
  difficulty?: DifficultyTier;

  @IsOptional()
  @IsEnum(GoalType)
  goalType?: GoalType;

  @IsOptional()
  @IsString()
  category?: string;

  /** Admin-only filter. Non-admins always see PUBLISHED. */
  @IsOptional()
  @IsEnum(ChallengeStatus)
  status?: ChallengeStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  perPage?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;
}
