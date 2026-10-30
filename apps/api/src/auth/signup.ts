import { AsyncLocalStorage } from 'node:async_hooks';
import { APIError } from 'better-auth/api';
import { ApiException } from '../common/api-exception';
import type { Database, Tx } from '../database/database.types';
import { createHouseholdOfOne } from '../family/household-of-one';
import { redeemPromoCode } from '../promo-codes/redeem-promo-code';

/** What the signup hook needs from the app; `createAuth` is handed it by AuthModule. */
export type SignupPolicy = {
  /** `SIGNUP_REQUIRES_PROMO_CODE`: a new Family needs a Promo Code and pays no Welcome Grant. */
  requiresPromoCode: boolean;
  /** Charges one failed-code attempt to the IP; throws 429 when used up; the result refunds it. */
  reserveIp: (ip: string) => () => void;
};

export const OPEN_SIGNUP: SignupPolicy = {
  requiresPromoCode: false,
  reserveIp: () => () => undefined,
};

/** The extras a signup request may carry (read from the request body, never stored on the user). */
export type SignupRequest = {
  promoCode?: string;
  ip: string;
};

export type SignupPlacement = {
  familyId: string;
  familyRole: 'owner' | 'member';
  /** Set only when the Member received the Welcome Grant. */
  welcomeGrantAt?: Date;
};

const signupTx = new AsyncLocalStorage<Tx>();

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
            (tx: Tx) => signupTx.run(tx, () => cb(tx)),
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

const STATUS_NAMES: Record<
  number,
  'BAD_REQUEST' | 'NOT_FOUND' | 'CONFLICT' | 'TOO_MANY_REQUESTS'
> = {
  400: 'BAD_REQUEST',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  429: 'TOO_MANY_REQUESTS',
};

/** Better Auth reports a thrown ApiException as a 500; this keeps its status and stable code. */
function refuse(error: unknown): never {
  if (error instanceof ApiException) {
    const status = STATUS_NAMES[error.getStatus()] ?? 'BAD_REQUEST';
    throw new APIError(status, {
      message: error.code,
      code: error.code,
    });
  }
  throw error;
}

/**
 * Decides where a new Member lands, inside the signup transaction (ADR 0034). Any thrown refusal
 * rolls the whole signup back.
 *
 * This is the create-vs-join decision point: #733 adds a join branch (a `joinInviteCode` on the
 * request) ahead of `createFamily`, with no Household of One.
 */
export async function placeNewMember(
  newUser: { name: string; email: string },
  request: SignupRequest,
  policy: SignupPolicy,
): Promise<SignupPlacement> {
  try {
    return await createFamily(newUser, request, policy);
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
    const tx = signupTx.getStore();
    if (!tx)
      throw new Error(
        'A sign-up code must be redeemed inside the sign-up transaction',
      );
    // Only failures spend the budget: a good code refunds its charge.
    const refund = policy.reserveIp(request.ip);
    await redeemPromoCode(tx, {
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
