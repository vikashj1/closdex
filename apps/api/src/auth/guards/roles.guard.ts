import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@closdex/db';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthUser } from '../jwt.strategy';

/** Use after JwtAuthGuard. Allows the route when no @Roles set, else checks membership. */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const user = context.switchToHttp().getRequest().user as AuthUser | undefined;
    return !!user && required.includes(user.role);
  }
}
