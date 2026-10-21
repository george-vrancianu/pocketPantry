import { describe, expect, it } from 'vitest';
import { isValidBarcode } from './gtin';

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
