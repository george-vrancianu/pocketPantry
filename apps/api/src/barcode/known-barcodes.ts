import { and, eq } from 'drizzle-orm';
import { normalizeName } from '../catalog/normalize';
import type { Database, Tx } from '../database/database.types';
import { knownBarcodes } from '../database/schema';

export type KnownBarcodeSave = {
  barcode: string;
  /** Either the Ingredient the Batch was saved under, or its Unmatched name. */
  ingredientId: string | null;
  rawName: string | null;
  productDescription: string | null;
};

/**
 * The Family learns barcodes (ADR 0013): the latest save of a barcode replaces
 * what the Family remembered for it. Call it in the transaction that saves the
 * Batch; the Batch itself stores no barcode. Lines are applied in order, so the
 * last line for one barcode wins.
 */
export async function rememberBarcodes(
  tx: Tx,
  familyId: string,
  saves: KnownBarcodeSave[],
): Promise<void> {
  for (const save of saves) {
    const fields = {
      ingredientId: save.ingredientId,
      rawName: save.ingredientId ? null : save.rawName,
      normalizedName:
        save.ingredientId || !save.rawName ? null : normalizeName(save.rawName),
      productDescription: save.productDescription,
    };
    await tx
      .insert(knownBarcodes)
      .values({ familyId, barcode: save.barcode, ...fields })
      .onConflictDoUpdate({
        target: [knownBarcodes.familyId, knownBarcodes.barcode],
        set: { ...fields, updatedAt: new Date() },
      });
  }
}

export type KnownBarcode = typeof knownBarcodes.$inferSelect;

/** The Family's own Known Barcode for `barcode`, or null. Never another Family's. */
export async function findKnownBarcode(
  database: Database,
  familyId: string,
  barcode: string,
): Promise<KnownBarcode | null> {
  const [row] = await database
    .select()
    .from(knownBarcodes)
    .where(
      and(
        eq(knownBarcodes.familyId, familyId),
        eq(knownBarcodes.barcode, barcode),
      ),
    );
  return row ?? null;
}
