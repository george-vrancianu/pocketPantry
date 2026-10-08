import { invalidFields, type ReviewLine } from './review';

/**
 * Which field of a row takes focus when the Member opens it: the first
 * invalid or empty one (an entered bad value, a nameless Unmatched line, a
 * missing quantity), else the Match button.
 */
export function firstFocusField(line: ReviewLine): string {
  const invalid = invalidFields(line)[0];
  if (invalid) return invalid;
  if (line.quantity.trim() === '') return 'quantity';
  return 'match';
}
