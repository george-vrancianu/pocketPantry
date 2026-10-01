import { describe, expect, it } from 'vitest';
import { FALLBACK_LOCALE, LOCALES, resources } from './resources';

function keyPaths(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    keyPaths(child, prefix ? `${prefix}.${key}` : key),
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
        expect(keyPaths(resources[locale][namespace]).sort()).toEqual(
          keyPaths(reference[namespace]).sort(),
        );
      }
    },
  );

  it('has no empty strings', () => {
    for (const locale of LOCALES) {
      expect(JSON.stringify(resources[locale])).not.toContain('""');
    }
  });
});
