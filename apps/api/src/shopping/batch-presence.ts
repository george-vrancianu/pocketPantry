import { sql, type SQL } from 'drizzle-orm';
import { batches } from '../database/schema';

/** The server's UTC date, used when the Member's local date is not given. */
export const utcToday = (): string => new Date().toISOString().slice(0, 10);

/**
 * A Batch counts as present until its expiry date passes (an Expiring Soon Batch
 * still counts; quantity is ignored). `today` is the Member's local date.
 */
export const unexpiredBatch = (today: string): SQL =>
  sql`(${batches.expiryDate} IS NULL OR ${batches.expiryDate} >= ${today})`;
