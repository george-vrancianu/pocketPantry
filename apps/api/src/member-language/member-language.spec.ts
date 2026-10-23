import { resolveLanguage, resolveLanguages } from './member-language';

const none = { locale: null, catalogLanguage: null };

describe('Member language resolver', () => {
  it('uses the stored UI Language, then the request locale, then English', () => {
    expect(resolveLanguage('ui', { ...none, locale: 'da' }, 'ro')).toBe('da');
    expect(resolveLanguage('ui', none, 'ro')).toBe('ro');
    expect(resolveLanguage('ui', none)).toBe('en');
  });

  it('ignores a stored value that is not a catalog language', () => {
    expect(resolveLanguage('ui', { ...none, locale: 'fr' }, 'ro')).toBe('ro');
    expect(
      resolveLanguage('catalog', { locale: 'da', catalogLanguage: 'xx' }),
    ).toBe('da');
  });

  it('gives the Catalog Language the stored value, or the UI Language when empty', () => {
    expect(
      resolveLanguage('catalog', { locale: 'en', catalogLanguage: 'ro' }),
    ).toBe('ro');
    expect(resolveLanguage('catalog', { ...none, locale: 'da' }, 'ro')).toBe(
      'da',
    );
    expect(resolveLanguage('catalog', none, 'ro')).toBe('ro');
    expect(resolveLanguage('catalog', none)).toBe('en');
  });

  it('answers every role at once', () => {
    expect(resolveLanguages({ locale: 'en', catalogLanguage: 'ro' })).toEqual({
      ui: 'en',
      catalog: 'ro',
    });
  });
});
