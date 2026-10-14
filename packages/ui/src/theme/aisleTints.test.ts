import { describe, expect, it } from 'vitest';
import { aisleTint } from './aisleTints';

const DAIRY = '244cde4d-f9a5-5df8-9f40-5e1f48fd4fcf';
const PRODUCE = '1dff107d-5280-500f-807e-d694a53e24d9';

describe('aisleTint', () => {
  it('keeps the light and dark tints and adds a warm one', () => {
    expect(aisleTint(DAIRY)).toEqual({
      light: '#E3ECF3',
      dark: '#243440',
      warm: '#E4E9EA',
    });
    expect(aisleTint(PRODUCE).warm).toBe('#DFE7CF');
  });

  it('gives an unknown Aisle one neutral tint in every theme', () => {
    const tint = aisleTint('made-up-aisle');
    expect(tint.warm).toBe(tint.light);
    expect(tint.dark).toBe(tint.light);
  });
});
