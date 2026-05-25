import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

export const RATE_LIMIT_KEY = 'rateLimit';

interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export function RateLimit(opts: RateLimitOptions) {
  return (target: object, key?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) => {
    if (descriptor) {
      Reflect.defineMetadata(RATE_LIMIT_KEY, opts, descriptor.value);
    } else {
      Reflect.defineMetadata(RATE_LIMIT_KEY, opts, target);
    }
    return descriptor;
  };
}

interface Bucket {
  count: number;
  resetAt: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly store = new Map<string, Bucket>();

  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const handler = ctx.getHandler();
    const opts = this.reflector.get<RateLimitOptions>(RATE_LIMIT_KEY, handler);
    if (!opts) return true;

    const req = ctx.switchToHttp().getRequest<Request>();
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ??
      req.socket.remoteAddress ??
      'unknown';
    const key = `${ip}:${handler.name}`;
    const now = Date.now();

    let bucket = this.store.get(key);
    if (!bucket || now >= bucket.resetAt) {
      bucket = { count: 0, resetAt: now + opts.windowMs };
      this.store.set(key, bucket);
    }

    bucket.count += 1;
    if (bucket.count > opts.limit) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
      throw new HttpException(
        `Too many requests. Try again in ${retryAfter}s.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
