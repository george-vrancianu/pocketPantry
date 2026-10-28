import { randomUUID } from 'node:crypto';
import { getCurrentDBAdapterAsyncLocalStorage } from '@better-auth/core/context';
import { WELCOME_GRANT_CREDITS } from '../credits/credits.service';
import { generateInviteCode, inviteCodeExpiry } from './invite-code';

/**
 * The Family a Member is created into at signup, holding the Member's Welcome Grant; returns its id.
 *
 * Writes through the sign-up transaction's adapter so the Family commits or
 * rolls back together with the Member. Throws outside an active transaction:
 * Better Auth paths that create users without one (admin createUser,
 * magic-link, ...) must not silently recreate orphaned Families.
 * No Invite Code collision retry: a failed statement aborts the surrounding
 * transaction, and a clash is vanishingly rare.
 */
export async function createHouseholdOfOne(): Promise<string> {
  const store = (await getCurrentDBAdapterAsyncLocalStorage()).getStore();
  if (!store?.isTransactionActive) {
    throw new Error(
      'createHouseholdOfOne must run inside a Better Auth transaction',
    );
  }
  const id = randomUUID();
  await store.adapter.create({
    model: 'family',
    data: {
      id,
      inviteCode: generateInviteCode(),
      inviteCodeExpiresAt: inviteCodeExpiry(),
    },
    forceAllowId: true,
  });
  // The Member row is not written yet, so the grant names no Member; the caller marks the Member as
  // having received it (`user.welcome_grant_at`), which is what keeps it to once in their life.
  await store.adapter.create({
    model: 'creditEntry',
    data: {
      id: randomUUID(),
      familyId: id,
      kind: 'welcome_grant',
      reason: 'Welcome Grant',
      amount: WELCOME_GRANT_CREDITS,
    },
    forceAllowId: true,
  });
  return id;
}
