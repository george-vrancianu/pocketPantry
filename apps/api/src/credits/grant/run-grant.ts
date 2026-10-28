import type { Database } from '../../database/database.types';
import { GRANT_USAGE, parseGrantArgs } from './grant-args';
import { GrantRefusedError, grantCredits } from './grant-credits';

/** The testable body of `credits:grant`: parse, validate, grant. Returns the exit code and what to print. */
export async function runGrant(
  argv: string[],
  db: Database,
): Promise<{ code: number; message: string }> {
  const parsed = parseGrantArgs(argv);
  if (!parsed.ok)
    return { code: 1, message: `${parsed.message}\n${GRANT_USAGE}` };
  try {
    const balance = await grantCredits(db, parsed.input);
    return {
      code: 0,
      message: `Granted ${parsed.input.amount} Credits to Family ${parsed.input.familyId}. New Credit Balance: ${balance}.`,
    };
  } catch (error) {
    if (error instanceof GrantRefusedError)
      return { code: 1, message: error.message };
    throw error;
  }
}
