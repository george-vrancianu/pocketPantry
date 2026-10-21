/**
 * Barcodes and the canonical form each must get (null: not a barcode). One table for the
 * TypeScript rule (gtin.spec.ts) and the SQL copy of it in migration 0032
 * (canonical-barcodes-migration.int-spec.ts), so the two cannot drift apart.
 * apps/web/src/lib/gtin.test.ts keeps a copy of the same table: change them together.
 */
export const GTIN_FIXTURES: ReadonlyArray<
  readonly [label: string, raw: string, canonical: string | null]
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
