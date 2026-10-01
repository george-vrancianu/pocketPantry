import { eq } from 'drizzle-orm';
import type { Database } from '../database/database.types';
import { user } from '../database/schema';
import { createAuth, type CreateAuthOptions } from './create-auth';

export const TEST_ACCOUNT_PASSWORD = 'password123';

export const TEST_ACCOUNTS = [
  { name: 'Alice Test', email: 'alice@test.local' },
  { name: 'Bob Test', email: 'bob@test.local' },
] as const;

/**
 * Signs up the local test accounts through Better Auth, so each one gets its
 * Household of One exactly like a real signup. Idempotent: existing emails are
 * skipped. Never run against production.
 */
export async function seedTestAccounts(
  database: Database,
  options: CreateAuthOptions,
): Promise<string[]> {
  const auth = createAuth(database, options);
  const created: string[] = [];
  for (const account of TEST_ACCOUNTS) {
    const [existing] = await database
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, account.email));
    if (existing) continue;
    await auth.api.signUpEmail({
      body: { ...account, password: TEST_ACCOUNT_PASSWORD },
    });
    created.push(account.email);
  }
  return created;
}
