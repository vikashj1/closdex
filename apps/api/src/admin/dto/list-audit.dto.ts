import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListAuditDto {
  @IsOptional() @IsString()
  entity?: string;

  @IsOptional() @IsString()
  actorId?: string;

  @IsOptional() @IsString()
  action?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  perPage?: number = 50;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number = 1;
}
