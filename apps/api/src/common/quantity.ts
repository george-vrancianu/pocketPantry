/** Largest quantity a Batch or Shopping Item may hold (the columns are numeric(10,3) on Batches and numeric(12,3) on Shopping Items; this is the tighter cap). */
export const MAX_QUANTITY = 1_000_000;

export const exceedsMaxQuantity = (quantity: number | null): boolean =>
  quantity !== null && quantity > MAX_QUANTITY;
