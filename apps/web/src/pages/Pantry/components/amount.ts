import type { TFunction } from 'i18next';
import type { Unit } from '../../../lib/catalog';

/** "500 g", "2 pcs". */
export function formatAmount(
  quantity: number,
  unit: Unit,
  language: string,
  t: TFunction,
): string {
  return `${new Intl.NumberFormat(language).format(quantity)} ${t(`common:units.${unit}`)}`;
}
