import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '@closdex/db';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  // SALESPERSON or COMPANY only — ADMIN is provisioned internally, not via signup.
  @IsEnum(UserRole)
  role!: UserRole;

  // Required when role is COMPANY: the company to create and own.
  @IsOptional()
  @IsString()
  @MinLength(2)
  companyName?: string;
}
