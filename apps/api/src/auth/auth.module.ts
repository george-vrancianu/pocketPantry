import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { AppConfig } from '../config/env';
import { allowedOrigins, isAllowedOrigin } from '../config/origins';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import * as schema from '../database/schema';
import { createHouseholdOfOne } from '../family/household';
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
              // Set by the signup hook below, never by clients (the column is NOT NULL).
              familyId: { type: 'string', required: false, input: false },
              familyRole: {
                type: 'string',
                defaultValue: 'member',
                input: false,
              },
            },
          },
          databaseHooks: {
            user: {
              create: {
                // Signing up creates a Household of One with the Member as Owner.
                before: async (newUser) => ({
                  data: {
                    ...newUser,
                    familyId: await createHouseholdOfOne(database),
                    familyRole: 'owner',
                  },
                }),
              },
            },
          },
          rateLimit: { enabled: true, window: 60, max: 100 },
          // Function form so our strict matcher governs, not better-auth's
          // looser `*` wildcard (which matches `10.a.evil.com`).
          trustedOrigins: (request) => {
            const clientOrigin = config.get('CLIENT_ORIGIN', { infer: true });
            const origin = request?.headers.get('origin');
            return origin &&
              isAllowedOrigin(origin, allowedOrigins(clientOrigin))
              ? [clientOrigin, origin]
              : [clientOrigin];
          },
        }),
    },
    AuthGuard,
    AdminRoleGuard,
  ],
  exports: [AUTH, AuthGuard, AdminRoleGuard],
})
export class AuthModule {}
