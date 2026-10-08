import { beforeEach, describe, expect, it } from 'vitest';
import {
  loadScanLanguage,
  saveScanLanguage,
  scanLanguageOptions,
} from './scanLanguage';

describe('scan language choice', () => {
  beforeEach(() => window.localStorage.clear());

  it('defaults to the UI language', () => {
    expect(loadScanLanguage('ro')).toBe('ro');
  });

  it('remembers the last choice for the same UI language', () => {
    saveScanLanguage('ro', 'da');
    expect(loadScanLanguage('ro')).toBe('da');
  });

  it('resets to the new UI language when the UI language changes', () => {
    saveScanLanguage('ro', 'da');
    expect(loadScanLanguage('en')).toBe('en');
  });

  it('ignores a stored value that is not a Scan Language', () => {
    window.localStorage.setItem(
      'pocket-pantry.scan-language',
      JSON.stringify({ locale: 'en', language: 'xx' }),
    );
    expect(loadScanLanguage('en')).toBe('en');
    window.localStorage.setItem('pocket-pantry.scan-language', 'not json');
    expect(loadScanLanguage('en')).toBe('en');
  });
});

describe('scanLanguageOptions', () => {
  it('lists the UI language first, each under its own name', () => {
    expect(scanLanguageOptions('ro')).toEqual([
      { value: 'ro', label: 'Română' },
      { value: 'en', label: 'English' },
      { value: 'da', label: 'Dansk' },
    ]);
    expect(scanLanguageOptions('en').map((o) => o.value)).toEqual([
      'en',
      'ro',
      'da',
    ]);
  });
});
