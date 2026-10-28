import type { INestApplication } from '@nestjs/common';
import { CreditsService } from '../../src/credits/credits.service';

/**
 * Leaves the Member's Family with exactly `balance` Credits by holding the rest through the ledger
 * service. Test-only: there is no production way to take Credits away, and grants by hand are #695.
 */
export async function setBalance(
  app: INestApplication,
  memberId: string,
  balance: number,
): Promise<void> {
  const credits = app.get(CreditsService);
  const current = await credits.balanceOfMember(memberId);
  if (current < balance) throw new Error('setBalance only lowers a balance');
  if (current > balance)
    await credits.hold(memberId, 'scan', current - balance);
}
