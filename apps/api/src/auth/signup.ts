import { AsyncLocalStorage } from 'node:async_hooks';
import { APIError } from 'better-auth/api';
import { eq } from 'drizzle-orm';
import { ApiException } from '../common/api-exception';
import type { Database, Tx } from '../database/database.types';
import {
  WELCOME_GRANT_CREDITS,
  WELCOME_GRANT_REASON,
  lockFamilyCredits,
} from '../credits/credits.service';
import { creditEntry, family, promoCode } from '../database/schema';
import { lockFamilies } from '../family/family-locks';
import {
  looksLikePromoCode,
  normalizeInviteCode,
  normalizePromoCode,
} from '../family/invite-code';
import { createHouseholdOfOne } from '../family/household-of-one';
import { redeemPromoCode } from '../promo-codes/redeem-promo-code';

/** What the signup hook needs from the app; `createAuth` is handed it by AuthModule. */
export type SignupPolicy = {
  /** `SIGNUP_REQUIRES_PROMO_CODE`: a new Family needs a Promo Code and pays no Welcome Grant. */
  requiresPromoCode: boolean;
  /** Charges one failed-code attempt to the IP; throws 429 when used up; the result refunds it. */
  reserveIp: (ip: string) => () => void;
  /** Same for an Invite Code tried at signup: the per-IP Invite Code budget the Family page shares. */
  reserveInviteIp: (ip: string) => () => void;
};

export const OPEN_SIGNUP: SignupPolicy = {
  requiresPromoCode: false,
  reserveIp: () => () => undefined,
  reserveInviteIp: () => () => undefined,
};

/** The extras a signup request may carry (read from the request body, never stored on the user). */
export type SignupRequest = {
  promoCode?: string;
  /** The Invite Code of a Family to join instead of creating one. */
  joinInviteCode?: string;
  ip: string;
};

export type SignupPlacement = {
  familyId: string;
  familyRole: 'owner' | 'member';
  /** Set only when the Member received the Welcome Grant. */
  welcomeGrantAt?: Date;
};

/** The sign-up transaction, and the rows written at signup that name no Member yet (linked once it exists). */
type SignupStore = {
  tx: Tx;
  /** The Promo Code redeemed at signup and its Credit entry. */
  redeemed?: { promoCodeId: string; entryId: string };
  /** The joiner's Welcome Grant entry (kind `grant`, in the joined Family). */
  welcomeGrantEntryId?: string;
};
const signupTx = new AsyncLocalStorage<SignupStore>();

/**
 * Wraps the database so the Drizzle transaction Better Auth opens for sign-up (`transaction: true`)
 * is also readable by the create hook. The hook's adapter is not handed that transaction, and
 * `redeemPromoCode` needs a Drizzle one: sharing it keeps the redemption in the signup's transaction,
 * so any refusal rolls back the user, Family, Credit entries and the redeemed code together.
 */
export function exposeSignupTransaction(database: Database): Database {
  return new Proxy(database, {
    get(target, prop) {
      if (prop === 'transaction') {
        return (cb: (tx: Tx) => Promise<unknown>, config?: unknown) =>
          (target.transaction as (...args: unknown[]) => unknown)(
            (tx: Tx) => signupTx.run({ tx }, () => cb(tx)),
            config,
          );
      }
      const value: unknown = Reflect.get(target, prop, target);
      return typeof value === 'function'
        ? (value as (...args: unknown[]) => unknown).bind(target)
        : value;
    },
  });
}

/** Add a status here when a signup refusal starts using it. */
const STATUS_NAMES: Record<
  number,
  'BAD_REQUEST' | 'NOT_FOUND' | 'CONFLICT' | 'GONE' | 'TOO_MANY_REQUESTS'
> = {
  400: 'BAD_REQUEST',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  410: 'GONE',
  429: 'TOO_MANY_REQUESTS',
};

/**
 * Runs once the user row exists, inside the signup transaction: the Promo Code Credit entry and the
 * code were written before the Member, so they name no Member yet. Links them to the new Member.
 */
export async function linkSignupRedemption(userId: string): Promise<void> {
  const store = signupTx.getStore();
  if (!store) return;
  const { tx, redeemed, welcomeGrantEntryId } = store;
  store.redeemed = undefined;
  store.welcomeGrantEntryId = undefined;
  if (redeemed) {
    await tx
      .update(creditEntry)
      .set({ memberId: userId })
      .where(eq(creditEntry.id, redeemed.entryId));
    await tx
      .update(promoCode)
      .set({ redeemedBy: userId })
      .where(eq(promoCode.id, redeemed.promoCodeId));
  }
  if (welcomeGrantEntryId) {
    await tx
      .update(creditEntry)
      .set({ memberId: userId })
      .where(eq(creditEntry.id, welcomeGrantEntryId));
  }
}

/** Better Auth reports a thrown ApiException as a 500; this keeps its status and stable code. */
function refuse(error: unknown): never {
  if (error instanceof ApiException) {
    const status = STATUS_NAMES[error.getStatus()];
    if (!status) {
      throw new Error(`Signup refusal ${error.code} has an unmapped status`);
    }
    throw new APIError(
      status,
      { message: error.code, code: error.code },
      typeof error.params.retryAfter === 'number'
        ? { 'Retry-After': String(error.params.retryAfter) }
        : undefined,
    );
  }
  throw error;
}

/**
 * Decides where a new Member lands, inside the signup transaction (ADR 0034). Any thrown refusal
 * rolls the whole signup back.
 *
 * This is the create-vs-join decision point: a `joinInviteCode` on the request joins that Family as
 * a Member, with no Household of One; otherwise a new Family is created.
 */
export async function placeNewMember(
  newUser: { name: string; email: string },
  request: SignupRequest,
  policy: SignupPolicy,
): Promise<SignupPlacement> {
  try {
    const inviteCode = request.joinInviteCode?.trim();
    return inviteCode
      ? await joinFamily(newUser, inviteCode, request, policy)
      : await createFamily(newUser, request, policy);
  } catch (error) {
    return refuse(error);
  }
}

/** Household of One with the Member as Owner; the Welcome Grant, or the Promo Code's Credits, start it. */
async function createFamily(
  newUser: { name: string; email: string },
  request: SignupRequest,
  policy: SignupPolicy,
): Promise<SignupPlacement> {
  const code = request.promoCode?.trim() || undefined;
  if (policy.requiresPromoCode && !code) {
    throw new ApiException(400, 'promo_code.required');
  }
  const welcomeGrant = !policy.requiresPromoCode;
  const familyId = await createHouseholdOfOne({ welcomeGrant });
  if (code) {
    const store = signupTx.getStore();
    if (!store)
      throw new Error(
        'A sign-up code must be redeemed inside the sign-up transaction',
      );
    // Only failures spend the budget: a good code refunds its charge.
    const refund = policy.reserveIp(request.ip);
    store.redeemed = await redeemPromoCode(store.tx, {
      code,
      familyId,
      redeemer: { name: newUser.name, email: newUser.email },
    });
    refund();
  }
  return {
    familyId,
    familyRole: 'owner',
    welcomeGrantAt: welcomeGrant ? new Date() : undefined,
  };
}

/**
 * Joins the Family behind an Invite Code as a Member (no Household of One). The Invite Code is the
 * gate, so no Promo Code is needed; one sent anyway is redeemed into the joined Family. Locks follow
 * ADR 0001: the Family's credits lock first, then its row lock (so it can't race a regeneration, a
 * deletion or a redeem).
 */
async function joinFamily(
  newUser: { name: string; email: string },
  rawInviteCode: string,
  request: SignupRequest,
  policy: SignupPolicy,
): Promise<SignupPlacement> {
  const store = signupTx.getStore();
  if (!store) {
    throw new Error(
      'A sign-up code must be used inside the sign-up transaction',
    );
  }
  const { tx } = store;
  const refundInvite = policy.reserveInviteIp(request.ip);
  const code = normalizeInviteCode(rawInviteCode);
  if (looksLikePromoCode(normalizePromoCode(rawInviteCode))) {
    throw new ApiException(400, 'family.invite_code_is_promo_code');
  }
  const invalid = () => new ApiException(404, 'family.invite_code_invalid');
  const [peek] = await tx
    .select({ id: family.id })
    .from(family)
    .where(eq(family.inviteCode, code));
  if (!peek) throw invalid();
  await lockFamilyCredits(tx, peek.id);
  await lockFamilies(tx, [peek.id]);
  // Re-read under the lock: the Owner may have regenerated or deleted it meanwhile.
  const [target] = await tx.select().from(family).where(eq(family.id, peek.id));
  if (!target || target.inviteCode !== code) throw invalid();
  if (target.inviteCodeExpiresAt.getTime() <= Date.now()) {
    throw new ApiException(410, 'family.invite_code_expired');
  }
  // The Invite Code is good: it was not a failed guess, so a bad Promo Code below must not also spend this budget.
  refundInvite();

  const welcomeGrant = !policy.requiresPromoCode;
  if (welcomeGrant) {
    // Kind 'grant', not 'welcome_grant': `credit_entry_welcome_grant_idx` allows one per Family and
    // the joined Family has its own. `user.welcome_grant_at` is what keeps it to once per Member.
    const [grant] = await tx
      .insert(creditEntry)
      .values({
        familyId: target.id,
        kind: 'grant',
        reason: WELCOME_GRANT_REASON,
        amount: WELCOME_GRANT_CREDITS,
      })
      .returning({ id: creditEntry.id });
    store.welcomeGrantEntryId = grant.id;
  }
  const promo = request.promoCode?.trim();
  if (promo) {
    const refundPromo = policy.reserveIp(request.ip);
    store.redeemed = await redeemPromoCode(tx, {
      code: promo,
      familyId: target.id,
      redeemer: { name: newUser.name, email: newUser.email },
    });
    refundPromo();
  }
  return {
    familyId: target.id,
    familyRole: 'member',
    welcomeGrantAt: welcomeGrant ? new Date() : undefined,
  };
}
