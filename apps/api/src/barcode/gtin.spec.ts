import { normalizeBarcode } from './gtin';
import { GTIN_FIXTURES } from './gtin.fixtures';

describe('normalizeBarcode', () => {
  it.each(GTIN_FIXTURES)('fixture: %s', (_label, raw, canonical) => {
    expect(normalizeBarcode(raw)).toBe(canonical);
  });

  it.each([
    ['EAN-13 stays as it is', '3017620422003', '3017620422003'],
    ['UPC-A gets a leading 0', '036000291452', '0036000291452'],
    ['UPC-A and its EAN-13 form agree', '0036000291452', '0036000291452'],
    ['EAN-8 stays its own 8-digit form', '96385074', '96385074'],
  ])('%s', (_label, raw, canonical) => {
    expect(normalizeBarcode(raw)).toBe(canonical);
  });

  it.each([
    ['ending 0 to 2', '04252614', '0042100005264'],
    ['ending 3', '01234531', '0012300000451'],
    ['ending 4', '01234543', '0012340000053'],
    ['ending 5 to 9', '01234558', '0012345000058'],
  ])('expands UPC-E (%s) to GTIN-13', (_label, raw, canonical) => {
    expect(normalizeBarcode(raw)).toBe(canonical);
  });

  it('keeps an 8-digit code starting with 1 as EAN-8', () => {
    expect(normalizeBarcode('12345670')).toBe('12345670');
  });

  it.each(['3017620422004', '036000291453', '96385075', ''])(
    'rejects %j: wrong check digit or not a barcode',
    (raw) => {
      expect(normalizeBarcode(raw)).toBeNull();
    },
  );

  it.each(['abc', '123', '12345678901234', '30176 20422003', '3017620422003x'])(
    'rejects %j: not 8, 12 or 13 digits',
    (raw) => {
      expect(normalizeBarcode(raw)).toBeNull();
    },
  );
});
