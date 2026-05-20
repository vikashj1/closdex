import { IsIn, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export type DisputeAction = 'ADJUST' | 'REJECT';

export class ResolveDisputeDto {
  @IsIn(['ADJUST', 'REJECT'])
  action!: DisputeAction;

  @IsString()
  @MinLength(5)
  resolution!: string;

  /** Required when action is ADJUST — the new finalScore for the attempt. */
  @IsOptional()
  @IsInt()
  @Min(0)
  newScore?: number;
}
