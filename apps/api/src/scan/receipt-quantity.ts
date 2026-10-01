export type ReceiptQuantityInput = {
  quantityType: 'count' | 'package_size' | 'measured' | null;
  purchasedCount: number | null;
  quantityPerItem: number | null;
  quantityUnit: string | null;
};

export type DerivedReceiptQuantity = {
  quantityType: Exclude<ReceiptQuantityInput['quantityType'], null>;
  purchasedCount: number;
  quantityPerItem: number | null;
  quantityUnit: string | null;
  quantity: number;
  unit: string;
};

const UNIT_ALIASES: Record<string, string> = {
  buc: 'item',
  bucata: 'item',
  bucati: 'item',
  piece: 'item',
  pieces: 'item',
  pc: 'item',
  pcs: 'item',
  item: 'item',
  items: 'item',
  gram: 'g',
  grams: 'g',
  gr: 'g',
  g: 'g',
  kilogram: 'kg',
  kilograms: 'kg',
  kgs: 'kg',
  kg: 'kg',
  milligram: 'mg',
  milligrams: 'mg',
  mg: 'mg',
  milliliter: 'ml',
  milliliters: 'ml',
  millilitre: 'ml',
  millilitres: 'ml',
  ml: 'ml',
  centiliter: 'cl',
  centiliters: 'cl',
  centilitre: 'cl',
  centilitres: 'cl',
  cl: 'cl',
  liter: 'l',
  liters: 'l',
  litre: 'l',
  litres: 'l',
  l: 'l',
};

function normalizeUnit(unit: string): string {
  const normalized = unit.trim().toLocaleLowerCase('en-US').replaceAll('.', '');
  return UNIT_ALIASES[normalized] ?? normalized;
}

function roundQuantity(value: number): number {
  return Number(value.toFixed(6));
}

function extractPrintedQuantity(
  sourceText: string,
): Pick<ReceiptQuantityInput, 'quantityPerItem' | 'quantityUnit'> | null {
  const matches = [
    ...sourceText.matchAll(/(\d+(?:[.,]\d+)?)\s*(mg|kg|g|ml|cl|l)\b/giu),
  ];
  const match = matches.at(-1);
  if (!match) return null;

  const quantity = Number(match[1].replace(',', '.'));
  if (!Number.isFinite(quantity) || quantity <= 0) return null;

  return {
    quantityPerItem: quantity,
    quantityUnit: normalizeUnit(match[2]),
  };
}

export function deriveReceiptQuantity(
  input: ReceiptQuantityInput,
  sourceText = '',
): DerivedReceiptQuantity | null {
  if (!input.quantityType || !input.purchasedCount) return null;

  const printedQuantity = extractPrintedQuantity(sourceText);
  const quantityType =
    input.quantityType === 'count' && printedQuantity
      ? 'package_size'
      : input.quantityType;

  if (quantityType === 'count') {
    return {
      quantityType,
      purchasedCount: input.purchasedCount,
      quantityPerItem: null,
      quantityUnit: null,
      quantity: roundQuantity(input.purchasedCount),
      unit: 'item',
    };
  }

  const quantityPerItem =
    printedQuantity?.quantityPerItem ?? input.quantityPerItem;
  const quantityUnit = printedQuantity?.quantityUnit ?? input.quantityUnit;
  if (!quantityPerItem || !quantityUnit) return null;

  const multiplier = quantityType === 'package_size' ? input.purchasedCount : 1;
  return {
    quantityType,
    purchasedCount: input.purchasedCount,
    quantityPerItem,
    quantityUnit: normalizeUnit(quantityUnit),
    quantity: roundQuantity(quantityPerItem * multiplier),
    unit: normalizeUnit(quantityUnit),
  };
}
