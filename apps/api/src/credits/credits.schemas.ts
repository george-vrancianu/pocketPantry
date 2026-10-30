/** The kinds of read a Credit Price is set for (the Admin Catalog Suggest Guidance has none). */
export type CreditPriceKind =
  | 'scan'
  | 'voice'
  | 'assistant'
  | 'link-page'
  | 'link-text'
  | 'guidance'
  | 'plate-recipe';

/** What one successful read of each kind costs, in Credits. */
export type CreditPrices = Record<CreditPriceKind, number>;

/** The Credits at or below which every Member of the Family is warned. */
export const LOW_BALANCE_THRESHOLD = 10;

/** How many history entries `GET /api/credits` returns. */
export const HISTORY_LIMIT = 20;

export type CreditEntryKind =
  | 'welcome_grant'
  | 'grant'
  | 'spend'
  | 'transfer_in'
  | 'transfer_out'
  | 'promo_code';

/**
 * One entry of the Family's Credit history. The client words it by `kind` (and `readKind` for a spend),
 * never by stored text; `reason` is only set for a `grant` by hand, as the owner typed it.
 * `memberName` names who made a `spend` or whose Household of One a `transfer_in` came from; it is null
 * for grants, which have no Member. `formerMember` is true when that Member has left or been deleted.
 */
export type CreditHistoryEntry = {
  id: string;
  kind: CreditEntryKind;
  readKind: CreditPriceKind | null;
  reason: string | null;
  /** Signed: negative for a spend, positive for Credits given. */
  amount: number;
  memberName: string | null;
  formerMember: boolean;
  createdAt: string;
};

/**
 * `GET /api/credits`: the Credit Balance of the Member's Family, the Credit Prices, the low-balance
 * threshold (the notice shows when `balance <= lowBalanceThreshold`) and the latest `HISTORY_LIMIT`
 * entries, newest first. A read still running holds its Credits as a spend, so it is already counted in
 * `balance` and listed here; if the read fails or finds nothing, the entry disappears.
 */
export type CreditsView = {
  balance: number;
  prices: CreditPrices;
  lowBalanceThreshold: number;
  history: CreditHistoryEntry[];
};
