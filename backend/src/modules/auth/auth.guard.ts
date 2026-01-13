import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import type { Secret } from 'jsonwebtoken';

function getJwtSecret(): Secret {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  return secret;
}

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<any>();
    const header = (req.headers?.authorization ?? req.headers?.Authorization) as string | undefined;
    if (!header || typeof header !== 'string') {
      throw new UnauthorizedException('missing_authorization');
    }
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('invalid_authorization');
    }
    try {
      const payload = jwt.verify(token, getJwtSecret());
      req.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('invalid_token');
    }
  }
}
