/** The kinds of read a Credit Price is set for (the Admin Catalog Suggest Guidance has none). */
export type CreditPriceKind =
  'scan' | 'voice' | 'assistant' | 'link-page' | 'link-text' | 'guidance';

/** What one successful read of each kind costs, in Credits. */
export type CreditPrices = Record<CreditPriceKind, number>;

/**
 * `GET /api/credits`: the Credit Balance of the Member's Family and the Credit Prices.
 * Later tickets add the low-balance threshold and the recent history beside these; nothing here changes.
 */
export type CreditsView = {
  balance: number;
  prices: CreditPrices;
};
