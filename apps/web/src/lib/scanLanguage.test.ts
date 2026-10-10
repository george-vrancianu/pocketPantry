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

  it('defaults to Danish under a Danish UI', () => {
    expect(loadScanLanguage('da')).toBe('da');
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
  it('lists the UI language first, each as a compact code', () => {
    expect(scanLanguageOptions('ro')).toEqual([
      { value: 'ro', label: 'RO' },
      { value: 'en', label: 'EN' },
      { value: 'da', label: 'DA' },
    ]);
    expect(scanLanguageOptions('en').map((o) => o.value)).toEqual([
      'en',
      'ro',
      'da',
    ]);
  });

  it('puts DA first under a Danish UI', () => {
    expect(scanLanguageOptions('da')).toEqual([
      { value: 'da', label: 'DA' },
      { value: 'en', label: 'EN' },
      { value: 'ro', label: 'RO' },
    ]);
  });
});
