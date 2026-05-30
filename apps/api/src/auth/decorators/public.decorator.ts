import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route handler (or whole controller) as publicly accessible. The
 * JwtAuthGuard checks this flag and skips token validation when set; the
 * handler still receives `@CurrentUser()` which may be `undefined` for anon.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
