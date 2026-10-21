import { randomUUID } from 'node:crypto';
import { hasValidCheckDigit } from '../../src/barcode/gtin';

/**
 * A valid barcode (right check digit) no other test has used. The Open Food Facts
 * cache is shared across tests and suites in a worker's database, so every test
 * uses its own barcode. It never starts with 0, so it is already in canonical
 * form (a 12-digit one is a UPC-A, which the API stores with a leading 0).
 */
export const freshBarcode = (length = 13): string => {
  const digits = BigInt(`0x${randomUUID().replaceAll('-', '')}`).toString();
  const body = `1${digits.slice(-(length - 2)).padStart(length - 2, '1')}`;
  for (let check = 0; check < 10; check += 1) {
    if (hasValidCheckDigit(`${body}${check}`)) return `${body}${check}`;
  }
  throw new Error('unreachable: one check digit always fits');
};
