/**
 * Whether the API accepts `code` as a barcode: 8 (EAN-8 or UPC-E), 12 (UPC-A) or 13 (EAN-13)
 * digits with a valid check digit. A copy of the rule in apps/api/src/barcode/gtin.ts, which is
 * the source of truth: keep the two in step, so the client never sends what the API rejects
 * (one rejected barcode would fail a whole Batch save). The API also canonicalises the code.
 */
export function isValidBarcode(code: string): boolean {
  if (!/^(?:\d{8}|\d{12}|\d{13})$/.test(code)) return false;
  if (
    code.length === 8 &&
    code.startsWith('0') &&
    hasCheckDigit(expandUpcE(code))
  )
    return true;
  return hasCheckDigit(code);
}

function hasCheckDigit(digits: string): boolean {
  let sum = 0;
  for (let index = 0; index < digits.length - 1; index += 1) {
    sum +=
      Number(digits[index]) * ((digits.length - 1 - index) % 2 === 1 ? 3 : 1);
  }
  return (10 - (sum % 10)) % 10 === Number(digits.at(-1));
}

/** The 12-digit UPC-A of a UPC-E (number system 0). */
function expandUpcE(code: string): string {
  const [system, a, b, c, d, e, last, check] = code;
  if (last <= '2') return `${system}${a}${b}${last}0000${c}${d}${e}${check}`;
  if (last === '3') return `${system}${a}${b}${c}00000${d}${e}${check}`;
  if (last === '4') return `${system}${a}${b}${c}${d}00000${e}${check}`;
  return `${system}${a}${b}${c}${d}${e}0000${last}${check}`;
}
