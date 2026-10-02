import { describe, expect, it } from 'vitest';
import { mergeReceiptSections } from './receiptSections';
import type { ProposedLine } from './scan';

const line = (name: string, extra: object = {}): ProposedLine => ({
  name,
  match: null,
  lowConfidence: false,
  quantity: null,
  unit: null,
  expiryDate: null,
  productDescription: null,
  ...extra,
});

describe('mergeReceiptSections', () => {
  it('concatenates lines in section order', () => {
    const merged = mergeReceiptSections([
      { lines: [line('Eggs'), line('Milk')] },
      { lines: [] },
      { lines: [line('Rice')] },
    ]);
    expect(merged.lines.map((l) => l.name)).toEqual(['Eggs', 'Milk', 'Rice']);
  });

  it('takes the first non-null merchant and date in section order', () => {
    const merged = mergeReceiptSections([
      { lines: [], merchantName: null, purchaseDate: '2026-09-25' },
      { lines: [], merchantName: 'Piata', purchaseDate: '2026-09-26' },
      { lines: [], merchantName: 'Other' },
    ]);
    expect(merged.merchantName).toBe('Piata');
    expect(merged.purchaseDate).toBe('2026-09-25');
  });

  it('leaves merchant and date null when no section carries them', () => {
    expect(mergeReceiptSections([{ lines: [] }])).toEqual({
      lines: [],
      merchantName: null,
      purchaseDate: null,
    });
  });
});
