import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { betterAuth, getCurrentAdapter } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { AppConfig } from '../config/env';
import { allowedOrigins, isAllowedOrigin } from '../config/origins';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import * as schema from '../database/schema';
import { createHouseholdOfOne } from '../family/household-of-one';
import { AUTH } from './auth.constants';
import { AdminRoleGuard } from './admin-role.guard';
import { AuthGuard } from './auth.guard';

/** The transaction adapter of the in-flight sign-up; refuses to fall back to an unscoped write. */
async function currentAdapter(
  context: { context: { adapter: unknown } } | null,
) {
  const adapter = await getCurrentAdapter(context?.context.adapter as never);
  if (!adapter) throw new Error('No adapter available to create the Family');
  return adapter;
}

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
            // Sign-up runs in one transaction so the Family created by the
            // hook below rolls back if the user insert fails.
            transaction: true,
          }),
          emailAndPassword: { enabled: true },
          plugins: [
            {
              // Registers our Family table as a Better Auth model so the hook
              // can write it through the sign-up transaction adapter.
              id: 'family-model',
              schema: {
                family: {
                  fields: {
                    inviteCode: { type: 'string', required: true },
                    inviteCodeExpiresAt: { type: 'date', required: true },
                  },
                },
              },
            },
          ],
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
                // Written through the current (transaction) adapter, never the
                // raw handle, so it is atomic with the user insert.
                before: async (newUser, context) => ({
                  data: {
                    ...newUser,
                    familyId: await createHouseholdOfOne(
                      await currentAdapter(context),
                    ),
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
