import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { detectLocale, saveLocale } from './locale-storage';

describe('detectLocale', () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('detects a Danish browser language such as da-DK', () => {
    vi.spyOn(window.navigator, 'language', 'get').mockReturnValue('da-DK');
    expect(detectLocale()).toBe('da');
  });

  it('prefers the saved choice over the browser language', () => {
    vi.spyOn(window.navigator, 'language', 'get').mockReturnValue('da-DK');
    saveLocale('ro');
    expect(detectLocale()).toBe('ro');
  });

  it('falls back to English for an unsupported browser language', () => {
    vi.spyOn(window.navigator, 'language', 'get').mockReturnValue('fr-FR');
    expect(detectLocale()).toBe('en');
  });
});
