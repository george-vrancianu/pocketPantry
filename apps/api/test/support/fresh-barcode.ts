import { randomUUID } from 'node:crypto';
import { hasValidCheckDigit } from '../../src/barcode/gtin';

/**
 * A valid barcode (right check digit) no other test has used. The Open Food Facts
 * cache is shared across tests and suites in a worker's database, so every test
 * uses its own barcode. It never starts with 0, so it is already in canonical
 * form (a 12-digit one is a UPC-A, which the API stores with a leading 0).
 */
/** `body` with the one check digit that makes it a valid barcode. */
const withCheckDigit = (body: string): string => {
  for (let check = 0; check < 10; check += 1) {
    if (hasValidCheckDigit(`${body}${check}`)) return `${body}${check}`;
  }
  throw new Error('unreachable: one check digit always fits');
};

export const freshBarcode = (length = 13): string => {
  const digits = BigInt(`0x${randomUUID().replaceAll('-', '')}`).toString();
  const body = `1${digits.slice(-(length - 2)).padStart(length - 2, '1')}`;
  return withCheckDigit(body);
};

/**
 * A UPC-E no other test has used, with the GTIN-13 it expands to. Built from a six-digit body
 * ending in 5 to 9 (the manufacturer keeps five digits, the product code is the sixth).
 */
export const freshUpcE = (): { upcE: string; gtin13: string } => {
  const digits = BigInt(`0x${randomUUID().replaceAll('-', '')}`).toString();
  const body = `${digits.slice(-5).padStart(5, '1')}${5 + (Number(digits.at(-6)) % 5)}`;
  const upcA = `0${body.slice(0, 5)}0000${body[5]}`;
  const gtin13 = `0${withCheckDigit(upcA)}`;
  return { upcE: `0${body}${gtin13.at(-1)}`, gtin13 };
};
