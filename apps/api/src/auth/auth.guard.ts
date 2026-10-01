import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { fromNodeHeaders } from 'better-auth/node';
import { ApiException } from '../common/api-exception';
import { AUTH } from './auth.constants';
import type { AuthInstance, CurrentUser } from './auth.types';

export type AuthenticatedRequest = FastifyRequest & { user: CurrentUser };

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(AUTH) private readonly auth: AuthInstance) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const session = await this.auth.api.getSession({
      headers: fromNodeHeaders(request.raw.headers),
    });

    if (!session?.user) {
      throw new ApiException(401, 'auth.unauthenticated');
    }

    (request as AuthenticatedRequest).user = session.user;
    return true;
  }
}
