import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequest } from './auth.guard';
import type { CurrentUser as CurrentUserValue } from './auth.types';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): CurrentUserValue =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().user,
);
