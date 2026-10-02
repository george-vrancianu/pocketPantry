/** Largest quantity a Batch or Shopping Item may hold (column is numeric(10,3)). */
export const MAX_QUANTITY = 1_000_000;

export const exceedsMaxQuantity = (quantity: number | null): boolean =>
  quantity !== null && quantity > MAX_QUANTITY;
