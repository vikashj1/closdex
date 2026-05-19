import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@closdex/db';

export const ROLES_KEY = 'roles';

/** Restrict a route/controller to the given roles. Enforced by RolesGuard. */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
