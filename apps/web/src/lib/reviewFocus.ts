import { invalidFields, type ReviewField, type ReviewLine } from './review';

/**
 * Which field of a row takes focus when the Member opens it, walking the panel
 * in screen order: a blank Unmatched name, an invalid or missing quantity, an
 * invalid expiry; else the Match button.
 */
export function firstFocusField(line: ReviewLine): ReviewField | 'match' {
  const invalid = invalidFields(line);
  if (invalid.includes('name')) return 'name';
  if (invalid.includes('quantity') || line.quantity.trim() === '')
    return 'quantity';
  if (invalid.includes('expiry')) return 'expiry';
  return 'match';
}
