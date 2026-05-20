import { IsString } from 'class-validator';

export class AddShortlistEntryDto {
  @IsString()
  salespersonId!: string;
}
