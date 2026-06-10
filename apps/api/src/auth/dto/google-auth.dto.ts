import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '@closdex/db';

/** Body for POST /auth/google. The frontend obtains an ID token from
 *  Google Identity Services and posts it here for verification. */
export class GoogleAuthDto {
  @IsString()
  @MinLength(20)
  idToken!: string;

  /** Role applied only when a new account is created. Existing users keep
   *  whatever role they already had. */
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  /** Required when role=COMPANY and the account is new. */
  @IsOptional()
  @IsString()
  @MinLength(2)
  companyName?: string;
}
