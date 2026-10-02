import type { TFunction } from 'i18next';
import type { Unit } from '../../../lib/catalog';

/** "500 g", "2 pcs", or just "3" for a quantity without a unit. */
export function formatAmount(
  quantity: number,
  unit: Unit | null,
  language: string,
  t: TFunction,
): string {
  return [
    new Intl.NumberFormat(language).format(quantity),
    unit ? t(`common:units.${unit}`) : null,
  ]
    .filter(Boolean)
    .join(' ');
}
