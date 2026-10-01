import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { AppConfig } from '../config/env';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import * as schema from '../database/schema';
import { AUTH } from './auth.constants';
import { AdminRoleGuard } from './admin-role.guard';
import { AuthGuard } from './auth.guard';

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
        betterAuth({
          appName: 'Pocket Pantry',
          baseURL: config.get('BETTER_AUTH_URL', { infer: true }),
          basePath: '/api/auth',
          secret: config.get('BETTER_AUTH_SECRET', { infer: true }),
          database: drizzleAdapter(database, {
            provider: 'pg',
            schema,
          }),
          emailAndPassword: { enabled: true },
          user: {
            additionalFields: {
              // Read-only for clients; admin assignment arrives in ticket #16.
              role: { type: 'string', defaultValue: 'regular', input: false },
            },
          },
          rateLimit: { enabled: true, window: 60, max: 100 },
          trustedOrigins: [
            config.get('CLIENT_ORIGIN', { infer: true }),
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:5174',
            'http://127.0.0.1:5174',
            'http://10.*.*.*:5173',
            'http://10.*.*.*:5174',
            'http://192.168.*.*:5173',
            'http://192.168.*.*:5174',
            'http://172.16.*.*:5173',
            'http://172.16.*.*:5174',
            'http://172.17.*.*:5173',
            'http://172.17.*.*:5174',
            'http://172.18.*.*:5173',
            'http://172.18.*.*:5174',
            'http://172.19.*.*:5173',
            'http://172.19.*.*:5174',
            'http://172.2*.*.*:5173',
            'http://172.2*.*.*:5174',
            'http://172.30.*.*:5173',
            'http://172.30.*.*:5174',
            'http://172.31.*.*:5173',
            'http://172.31.*.*:5174',
          ],
        }),
    },
    AuthGuard,
    AdminRoleGuard,
  ],
  exports: [AUTH, AuthGuard, AdminRoleGuard],
})
export class AuthModule {}
