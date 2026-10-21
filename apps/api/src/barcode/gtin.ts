/** Whether the last digit of `digits` is the GS1 check digit of the ones before it (any length). */
export function hasValidCheckDigit(digits: string): boolean {
  const body = digits.slice(0, -1);
  let sum = 0;
  for (let i = 0; i < body.length; i += 1) {
    // Weights 3,1,3,1... counted from the digit next to the check digit.
    const weight = (body.length - i) % 2 === 1 ? 3 : 1;
    sum += Number(body[i]) * weight;
  }
  return (10 - (sum % 10)) % 10 === Number(digits.at(-1));
}

/** The 12-digit UPC-A a UPC-E (8 digits, number system 0) stands for. */
function expandUpcE(upcE: string): string {
  const [system, a, b, c, d, e, last, check] = upcE;
  let body: string;
  if (last <= '2') body = `${system}${a}${b}${last}0000${c}${d}${e}`;
  else if (last === '3') body = `${system}${a}${b}${c}00000${d}${e}`;
  else if (last === '4') body = `${system}${a}${b}${c}${d}00000${e}`;
  else body = `${system}${a}${b}${c}${d}${e}0000${last}`;
  return `${body}${check}`;
}

/**
 * The one form a product barcode is looked up, cached and remembered under, or
 * null when `raw` is no valid barcode (wrong length, non-digits, bad check digit).
 *
 * - EAN-13 is canonical (GTIN-13): kept as is.
 * - UPC-A (12 digits) gets a leading 0, so it and its EAN-13 form are one code.
 * - 8 digits starting with 0 that read as a UPC-E with a valid check digit are
 *   expanded to UPC-A, then to GTIN-13. A code valid both as UPC-E and as EAN-8 is
 *   read as UPC-E. Only number system 0 is expanded: a UPC-E starting with 1 is rare
 *   and is taken for an EAN-8 (or rejected).
 * - Any other 8-digit code is an EAN-8 and stays its own 8-digit form: an EAN-8
 *   is not a zero-padded EAN-13 in practice.
 */
export function normalizeBarcode(raw: string): string | null {
  if (!/^(?:\d{8}|\d{12}|\d{13})$/.test(raw)) return null;
  if (raw.length === 8) {
    if (raw.startsWith('0')) {
      const upcA = expandUpcE(raw);
      if (hasValidCheckDigit(upcA)) return `0${upcA}`;
    }
    return hasValidCheckDigit(raw) ? raw : null;
  }
  const gtin13 = raw.padStart(13, '0');
  return hasValidCheckDigit(gtin13) ? gtin13 : null;
}
