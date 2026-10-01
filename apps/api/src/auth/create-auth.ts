import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { allowedOrigins, isAllowedOrigin } from '../config/origins';
import type { Database } from '../database/database.types';
import * as schema from '../database/schema';
import { createHouseholdOfOne } from '../family/household-of-one';
import { isAdminEmail } from './admin-emails';

export type CreateAuthOptions = {
  baseURL: string;
  secret: string;
  clientOrigin: string;
  /** Normalised ADMIN_EMAILS allow-list; matching signups get the admin role. */
  adminEmails: string[];
};

/** The Better Auth instance; shared by AuthModule and the dev seed. */
export function createAuth(database: Database, options: CreateAuthOptions) {
  return betterAuth({
    appName: 'Pocket Pantry',
    baseURL: options.baseURL,
    basePath: '/api/auth',
    secret: options.secret,
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
        // can write it through the sign-up transaction adapter. The
        // Drizzle schema (database/schema.ts) is the source of truth for
        // these columns; keep them in sync.
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
        // Read-only for clients; set only by the signup hook from ADMIN_EMAILS.
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
          // Written through the sign-up transaction (and refused outside
          // one), so it is atomic with the user insert.
          before: async (newUser) => ({
            data: {
              ...newUser,
              role: isAdminEmail(newUser.email, options.adminEmails)
                ? 'admin'
                : 'regular',
              familyId: await createHouseholdOfOne(),
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
      const { clientOrigin } = options;
      const origin = request?.headers.get('origin');
      return origin && isAllowedOrigin(origin, allowedOrigins(clientOrigin))
        ? [clientOrigin, origin]
        : [clientOrigin];
    },
  });
}
