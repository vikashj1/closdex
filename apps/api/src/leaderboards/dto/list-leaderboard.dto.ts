import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export type Period = 'daily' | 'weekly' | 'monthly' | 'all-time';

export class ListLeaderboardDto {
  @IsIn(['daily', 'weekly', 'monthly', 'all-time'])
  period: Period = 'all-time';

  /** Optional category filter (challenge.category). Omit for global. */
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 50;
}
