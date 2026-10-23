import { join } from 'node:path';
import { SCAN_LANGUAGES } from '../../catalog/catalog.schemas';
import { CASE_TAGS } from './voice-cases';
import { loadVoiceCaseSet } from './voice-replay';
import { nameIn } from './voice-catalog';
import { SEED_INGREDIENTS } from '../../catalog/seed/catalog-seed-data';

// The committed seed set: hand-written transcripts, not real Voice Notes.
const { catalog, cases } = loadVoiceCaseSet(join(__dirname, 'voice-cases'));

describe('seed Voice Note cases', () => {
  it.each(SCAN_LANGUAGES)('has at least 10 %s cases', (language) => {
    expect(
      cases.filter((c) => c.spokenLanguage === language).length,
    ).toBeGreaterThanOrEqual(10);
  });

  it.each(SCAN_LANGUAGES)('covers every category in %s: %s', (language) => {
    const tags = new Set(
      cases.filter((c) => c.spokenLanguage === language).flatMap((c) => c.tags),
    );
    expect([...tags].sort()).toEqual([...CASE_TAGS].sort());
  });

  it('says the cases are synthetic, so nobody mistakes them for recordings', () => {
    expect(cases.every((c) => c.source === 'synthetic')).toBe(true);
    expect(cases.every((c) => c.audioPath === undefined)).toBe(true);
  });

  it('keeps each case in the file and the Spoken Language its id says', () => {
    for (const c of cases) {
      expect(c.id.startsWith(`${c.spokenLanguage}-`)).toBe(true);
      expect(c.file).toBe(`${c.spokenLanguage}.json`);
    }
  });

  it('names every expected and listed Ingredient as the seed Catalog does in the case locale', () => {
    for (const c of cases) {
      const known = new Set(
        catalog.ingredients.map((i) => nameIn(i, c.locale)),
      );
      const names = [
        ...c.expected.actions.flatMap((a) => [a.ingredient].flat()),
        ...c.shoppingList,
        ...c.pantry,
      ];
      for (const name of names) {
        expect({ id: c.id, name, known: known.has(name) }).toEqual({
          id: c.id,
          name,
          known: true,
        });
      }
    }
  });

  it('sends the whole seed Catalog, not a trimmed copy', () => {
    expect(catalog.ingredients).toHaveLength(SEED_INGREDIENTS.length);
  });

  it('expects at least one unsupported phrase in the unsupported cases', () => {
    for (const c of cases.filter((c) => c.tags.includes('unsupported'))) {
      expect(c.expected.unsupported).toBeGreaterThan(0);
    }
  });

  it('has a mixed-lists case that uses both lists', () => {
    for (const language of SCAN_LANGUAGES) {
      const mixed = cases.filter(
        (c) => c.spokenLanguage === language && c.tags.includes('mixed-lists'),
      );
      expect(
        mixed.some(
          (c) =>
            new Set(
              c.expected.actions.map((a) => a.target).filter((t) => t !== null),
            ).size === 2,
        ),
      ).toBe(true);
    }
  });
});
