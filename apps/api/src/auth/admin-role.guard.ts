import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { ApiException } from '../common/api-exception';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { user } from '../database/schema';
import type { AuthenticatedRequest } from './auth.guard';

@Injectable()
export class AdminRoleGuard implements CanActivate {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const rows = await this.database
      .select({ role: user.role })
      .from(user)
      .where(eq(user.id, request.user.id))
      .limit(1);

    if (rows[0]?.role !== 'admin') {
      throw new ApiException(403, 'auth.admin_required');
    }
    return true;
  }
}
