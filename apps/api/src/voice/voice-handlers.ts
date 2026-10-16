import type { CatalogLocale } from '../catalog/catalog.schemas';
import type { Tx } from '../database/database.types';
import type {
  ResolvedRows,
  VoiceActionDraft,
  VoiceActionStatus,
  VoiceLocation,
  VoiceOp,
  VoiceTarget,
  VoiceUnit,
} from './voice-actions';

/** What a handler learns about the current lists; loaded once per request and shared. */
export type VoiceListsView = {
  /** The Family's Batches, soonest expiry first (undated last). */
  pantryBatches(): Promise<
    {
      id: string;
      ingredientId: string | null;
      name: string;
      quantity: number | null;
      unit: VoiceUnit | null;
      location: VoiceLocation;
      expiryDate: string | null;
    }[]
  >;
  shoppingItems(): Promise<
    {
      id: string;
      ingredientId: string | null;
      name: string;
      quantity: number | null;
      unit: VoiceUnit | null;
      checked: boolean;
    }[]
  >;
};

export type ResolveContext = {
  memberId: string;
  locale: CatalogLocale;
  /** The Member's local date. */
  today: string;
  lists: VoiceListsView;
};

export type Resolution = {
  status: Exclude<VoiceActionStatus, 'notUnderstood'>;
  rows: ResolvedRows;
  defaults: { location?: VoiceLocation; expiresOn?: string };
};

export type ApplyContext = {
  memberId: string;
  locale: CatalogLocale;
  /** The Member's local date (the client's, else the server's). */
  today: string;
  /** The one transaction of the whole Apply; each action runs in its own savepoint. */
  tx: Tx;
};

/** `skipped` carries the stable error code or reason Review names. */
export type ApplyOutcome =
  { applied: true } | { applied: false; reason: string };

/**
 * One (target, op) pair. `resolve` reads and never writes; `apply` re-checks
 * against the current lists and writes through the existing services in the
 * caller's transaction. New ops register a handler in `VoiceHandlers`.
 */
export type VoiceActionHandler = {
  resolve(draft: VoiceActionDraft, ctx: ResolveContext): Promise<Resolution>;
  apply(draft: VoiceActionDraft, ctx: ApplyContext): Promise<ApplyOutcome>;
};

export const handlerKey = (target: VoiceTarget, op: VoiceOp) =>
  `${target}:${op}`;
