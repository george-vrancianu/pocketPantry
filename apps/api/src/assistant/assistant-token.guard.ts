import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { ApiException } from '../common/api-exception';
import type { AssistantTokenMember } from '../assistant-tokens/assistant-token.schemas';
import { AssistantTokenService } from '../assistant-tokens/assistant-token.service';

export type AssistantRequestContext = FastifyRequest & {
  assistantMember: AssistantTokenMember;
};

/**
 * Authenticates an Assistant Request by its Bearer Assistant Token (ADR 0019).
 * A session cookie is never looked at: with no valid token the answer is 401.
 */
@Injectable()
export class AssistantTokenGuard implements CanActivate {
  constructor(private readonly tokens: AssistantTokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const secret = /^Bearer\s+(\S+)\s*$/i.exec(
      request.headers.authorization ?? '',
    )?.[1];
    const member = secret ? await this.tokens.lookup(secret) : null;
    if (!member) throw new ApiException(401, 'auth.unauthenticated');
    (request as AssistantRequestContext).assistantMember = member;
    return true;
  }
}
