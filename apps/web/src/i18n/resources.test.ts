import { describe, expect, it } from 'vitest';
import { FALLBACK_LOCALE, LOCALES, resources } from './resources';

/** Plural variants differ per locale (en: one/other, ro: one/few/other). */
const pluralBase = (path: string) =>
  path.replace(/_(zero|one|two|few|many|other)$/, '');

function keyPaths(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [pluralBase(prefix)];
  return Object.entries(value).flatMap(([key, child]) =>
    keyPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

function leaves(value: unknown, prefix = ''): [string, unknown][] {
  if (typeof value !== 'object' || value === null) return [[prefix, value]];
  return Object.entries(value).flatMap(([key, child]) =>
    leaves(child, prefix ? `${prefix}.${key}` : key),
  );
}

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

  // Unit and Location labels are repeated across namespaces; they must read the same everywhere.
  it.each(LOCALES)(
    '%s labels a unit or Location the same in every namespace',
    (locale) => {
      const labels = new Map<string, Set<unknown>>();
      for (const [path, label] of leaves(resources[locale])) {
        const match = /\.(units|locations)\.([^.]+)$/.exec(path);
        if (!match) continue;
        const key = `${match[1]}.${match[2]}`;
        labels.set(key, (labels.get(key) ?? new Set()).add(label));
      }
      for (const [key, seen] of labels) {
        expect([key, [...seen]]).toEqual([key, [[...seen][0]]]);
      }
    },
  );

  it('has no empty strings', () => {
    for (const locale of LOCALES) {
      expect(JSON.stringify(resources[locale])).not.toContain('""');
    }
  });
});
