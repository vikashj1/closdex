import { IsString } from 'class-validator';

export class ListShortlistsDto {
  @IsString()
  companyId!: string;
}
