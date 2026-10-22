import { describe, expect, it } from 'vitest';
import { defaultListFor } from './VoiceNote';

describe('defaultListFor', () => {
  it.each([
    ['/shopping', 'shopping'],
    ['/shopping/', 'shopping'],
    ['/pantry', 'pantry'],
    ['/shopping/staples', null],
    ['/pantry/x', null],
    ['/', null],
  ])('%s gives %s', (pathname, list) => {
    expect(defaultListFor(pathname)).toBe(list);
  });
});
