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

/** Every string under its full key, plural suffix included. */
function flat(value: unknown, prefix = ''): Record<string, string> {
  if (typeof value === 'string') return { [prefix]: value };
  if (typeof value !== 'object' || value === null) return {};
  return Object.assign(
    {},
    ...Object.entries(value).map(([key, child]) =>
      flat(child, prefix ? `${prefix}.${key}` : key),
    ),
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
    '%s uses exactly the placeholders of English, key by key',
    (locale) => {
      for (const namespace of Object.keys(reference)) {
        const english = flat(reference[namespace]);
        for (const [key, text] of Object.entries(
          flat(resources[locale][namespace]),
        )) {
          // A plural variant English lacks (ro `_few`) follows English `_other`.
          const source = english[key] ?? english[`${pluralBase(key)}_other`];
          expect(source, `${locale} ${namespace}.${key}`).toBeDefined();
          // `_one` may drop the count: some languages write "one" as a word.
          const ignore = key.endsWith('_one') ? ['{{count}}'] : [];
          const clean = (list: string[]) =>
            list.filter((p) => !ignore.includes(p));
          expect(
            clean(placeholders(text)),
            `${locale} ${namespace}.${key}`,
          ).toEqual(clean(placeholders(source)));
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
