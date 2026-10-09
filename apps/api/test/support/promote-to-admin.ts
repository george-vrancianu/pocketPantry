import { eq } from 'drizzle-orm';
import type { Database } from '../../src/database/database.types';
import { user } from '../../src/database/schema';

/** Grants the Admin role the only way it exists: directly in the database. */
export async function promoteToAdmin(
  database: Database,
  email: string,
): Promise<void> {
  const rows = await database
    .update(user)
    .set({ role: 'admin' })
    .where(eq(user.email, email))
    .returning({ id: user.id });
  if (rows.length !== 1) throw new Error(`No user to promote: ${email}`);
}
