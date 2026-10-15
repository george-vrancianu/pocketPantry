import { randomUUID } from 'node:crypto';

/**
 * A barcode no other test has used. The Open Food Facts cache is shared across
 * tests and suites in a worker's database, so every test uses its own barcode.
 */
export const freshBarcode = (length = 13): string => {
  const digits = BigInt(`0x${randomUUID().replaceAll('-', '')}`)
    .toString()
    .padStart(length, '1');
  return digits.slice(-length);
};
