import { describe, expect, it } from 'vitest';
import { FALLBACK_LOCALE, LOCALES, resources } from './resources';

/** Plural variants differ per locale (en: one/other, da: one/other, ro: one/few/other). */
const pluralBase = (path: string) =>
  path.replace(/_(zero|one|two|few|many|other)$/, '');

function keyPaths(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [pluralBase(prefix)];
  return Object.entries(value).flatMap(([key, child]) =>
    keyPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

function leaves(value: unknown, prefix = ''): [string, string][] {
  if (typeof value === 'string') return [[pluralBase(prefix), value]];
  if (typeof value !== 'object' || value === null) return [];
  return Object.entries(value).flatMap(([key, child]) =>
    leaves(child, prefix ? `${prefix}.${key}` : key),
  );
}

const placeholders = (text: string) =>
  [...new Set(text.match(/{{\s*\w+\s*}}/g) ?? [])].sort();

describe('translation resources', () => {
  const reference = resources[FALLBACK_LOCALE];

  it.each(LOCALES.filter((locale) => locale !== FALLBACK_LOCALE))(
    '%s has exactly the same namespaces and keys as English',
    (locale) => {
      expect(Object.keys(resources[locale]).sort()).toEqual(
        Object.keys(reference).sort(),
      );
      for (const namespace of Object.keys(reference)) {
        expect(
          [...new Set(keyPaths(resources[locale][namespace]))].sort(),
        ).toEqual([...new Set(keyPaths(reference[namespace]))].sort());
      }
    },
  );

  it.each(LOCALES.filter((locale) => locale !== FALLBACK_LOCALE))(
    '%s keeps the interpolation placeholders of English',
    (locale) => {
      for (const namespace of Object.keys(reference)) {
        const translated = leaves(resources[locale][namespace]);
        for (const [key, english] of leaves(reference[namespace])) {
          // A plural base can hold several variants; every variant must carry the placeholders it can.
          const variants = translated.filter(([k]) => k === key);
          expect(
            variants.length,
            `${locale} ${namespace}.${key}`,
          ).toBeGreaterThan(0);
          const englishCount = placeholders(english).filter(
            (p) => p !== '{{count}}',
          );
          for (const [, text] of variants) {
            for (const placeholder of englishCount) {
              expect(text, `${locale} ${namespace}.${key}`).toContain(
                placeholder,
              );
            }
          }
        }
      }
    },
  );

  it('includes Danish', () => {
    expect(LOCALES).toContain('da');
  });

  it('has no empty strings', () => {
    for (const locale of LOCALES) {
      expect(JSON.stringify(resources[locale])).not.toContain('""');
    }
  });
});
