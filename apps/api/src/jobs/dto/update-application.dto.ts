import { IsEnum } from 'class-validator';
import { ApplicationStatus } from '@closdex/db';

export class UpdateApplicationDto {
  @IsEnum(ApplicationStatus)
  status!: ApplicationStatus;
}
