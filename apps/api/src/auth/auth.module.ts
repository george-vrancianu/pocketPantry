import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../config/env';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { AUTH } from './auth.constants';
import { AdminRoleGuard } from './admin-role.guard';
import { AuthGuard } from './auth.guard';
import { parseAdminEmails } from './admin-emails';
import { createAuth } from './create-auth';

@Global()
@Module({
  providers: [
    {
      provide: AUTH,
      inject: [DATABASE, ConfigService],
      useFactory: (
        database: Database,
        config: ConfigService<AppConfig, true>,
      ) =>
        createAuth(database, {
          baseURL: config.get('BETTER_AUTH_URL', { infer: true }),
          secret: config.get('BETTER_AUTH_SECRET', { infer: true }),
          clientOrigin: config.get('CLIENT_ORIGIN', { infer: true }),
          adminEmails: parseAdminEmails(
            config.get('ADMIN_EMAILS', { infer: true }),
          ),
        }),
    },
    AuthGuard,
    AdminRoleGuard,
  ],
  exports: [AUTH, AuthGuard, AdminRoleGuard],
})
export class AuthModule {}
