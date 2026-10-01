import { randomUUID } from 'node:crypto';
import { getCurrentDBAdapterAsyncLocalStorage } from '@better-auth/core/context';
import { generateInviteCode, inviteCodeExpiry } from './invite-code';

/**
 * The empty Family a Member is created into at signup; returns its id.
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
  return id;
}
