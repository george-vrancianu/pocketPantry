import { describe, expect, it } from 'vitest';
import { isValidBarcode, normalizeBarcode } from './gtin';

// A copy of GTIN_FIXTURES in apps/api/src/barcode/gtin.fixtures.ts (web cannot import api files):
// change both together.
const GTIN_FIXTURES: Array<
  [label: string, raw: string, canonical: string | null]
> = [
  ['EAN-13 stays as it is', '3017620422003', '3017620422003'],
  ['UPC-A gets a leading 0', '036000291452', '0036000291452'],
  ['UPC-A and its EAN-13 form agree', '0036000291452', '0036000291452'],
  ['EAN-8 stays its own 8-digit form', '96385074', '96385074'],
  ['EAN-8 starting with 1', '12345670', '12345670'],
  ['UPC-E ending 0 to 2', '04252614', '0042100005264'],
  ['UPC-E ending 3', '01234531', '0012300000451'],
  ['UPC-E ending 4', '01234543', '0012340000053'],
  ['UPC-E ending 5 to 9', '01234558', '0012345000058'],
  ['EAN-13 with a wrong check digit', '3017620422004', null],
  ['UPC-A with a wrong check digit', '036000291453', null],
  ['EAN-8 with a wrong check digit', '96385075', null],
  ['UPC-E-shaped with a wrong check digit', '04252615', null],
  ['too short', '123', null],
  ['too long', '12345678901234', null],
  ['not digits', 'abc', null],
  ['a space inside', '30176 20422003', null],
  ['a trailing letter', '3017620422003x', null],
  ['empty', '', null],
];

describe('isValidBarcode', () => {
  it.each([
    ['EAN-13', '3017620422003'],
    ['UPC-A', '036000291452'],
    ['EAN-8', '96385074'],
    ['EAN-8 starting with 1', '12345670'],
    ['UPC-E', '04252614'],
    ['UPC-E ending 3', '01234531'],
    ['UPC-E ending 4', '01234543'],
    ['UPC-E ending 5 to 9', '01234558'],
  ])('accepts a valid %s', (_label, code) => {
    expect(isValidBarcode(code)).toBe(true);
  });

  it.each([
    '3017620422004',
    '036000291453',
    '96385075',
    '04252615',
    '123',
    '30176 20422003',
    '',
  ])('rejects %j', (code) => {
    expect(isValidBarcode(code)).toBe(false);
  });
});

describe('normalizeBarcode', () => {
  it.each(GTIN_FIXTURES)('fixture: %s', (_label, raw, canonical) => {
    expect(normalizeBarcode(raw)).toBe(canonical);
    expect(isValidBarcode(raw)).toBe(canonical !== null);
  });
});
