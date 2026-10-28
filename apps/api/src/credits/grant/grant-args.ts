import { parseArgs } from 'node:util';

export const GRANT_USAGE =
  'Usage: npm run credits:grant -w apps/api -- --family <family-id> --amount <whole number> --reason "<why>"';

export type GrantInput = { familyId: string; amount: number; reason: string };

export type ParsedGrantArgs =
  { ok: true; input: GrantInput } | { ok: false; message: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** `credit_entry.amount` is a Postgres integer. */
const MAX_AMOUNT = 2_147_483_647;

/** Parses and validates the command line of `credits:grant`. Pure: touches no database. */
export function parseGrantArgs(argv: string[]): ParsedGrantArgs {
  let values: { family?: string; amount?: string; reason?: string };
  try {
    ({ values } = parseArgs({
      args: argv,
      options: {
        family: { type: 'string' },
        amount: { type: 'string' },
        reason: { type: 'string' },
      },
      strict: true,
      allowPositionals: false,
    }));
  } catch (error) {
    const message = (error as Error).message;
    // `--amount -5`: node reads "-5" as a flag and calls the option ambiguous.
    if (/--amount/.test(message) && /ambiguous/.test(message))
      return {
        ok: false,
        message:
          'The amount must be a positive whole number (write a negative one as --amount=-5 to see it refused).',
      };
    return { ok: false, message };
  }

  const familyId = values.family?.trim();
  if (!familyId)
    return { ok: false, message: 'A Family id is required (--family).' };
  if (!UUID.test(familyId))
    return {
      ok: false,
      message: `"${familyId}" is not a Family id (expected a UUID).`,
    };

  const rawAmount = values.amount?.trim();
  if (!rawAmount)
    return { ok: false, message: 'An amount is required (--amount).' };
  if (!/^[0-9]+$/.test(rawAmount))
    return {
      ok: false,
      message: `The amount must be a positive whole number, got "${rawAmount}".`,
    };
  const amount = Number(rawAmount);
  if (amount <= 0)
    return { ok: false, message: 'The amount must be greater than zero.' };
  if (amount > MAX_AMOUNT)
    return { ok: false, message: `The amount must be at most ${MAX_AMOUNT}.` };

  const reason = values.reason?.trim();
  if (!reason)
    return { ok: false, message: 'A reason is required (--reason).' };

  return {
    ok: true,
    input: { familyId: familyId.toLowerCase(), amount, reason },
  };
}
