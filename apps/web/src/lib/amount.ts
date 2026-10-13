import type { TFunction } from 'i18next';
import type { Unit } from './catalog';

/** The amount a row holds: both fields can be empty ("some"). */
export type Amount = { quantity: number | null; unit: Unit | null };

/** "500 g", "2 pcs". */
export function formatAmount(
  quantity: number,
  unit: Unit,
  language: string,
  t: TFunction,
): string {
  return `${new Intl.NumberFormat(language).format(quantity)} ${t(`common:units.${unit}`)}`;
}

/**
 * An amount for a row's meta line, formatted for the language: "1,5 L", a bare "6" when there is no unit,
 * and null when there is no quantity.
 */
export function formatRowAmount(
  { quantity, unit }: Amount,
  language: string,
  t: TFunction,
): string | null {
  if (quantity === null) return null;
  return unit
    ? formatAmount(quantity, unit, language, t)
    : new Intl.NumberFormat(language).format(quantity);
}
