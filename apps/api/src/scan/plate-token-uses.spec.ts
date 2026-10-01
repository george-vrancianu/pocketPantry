import { PlateTokenUses } from './plate-token-uses';

describe('PlateTokenUses', () => {
  const T0 = 1_000;

  it('allows a title once per token, then refuses it', () => {
    const uses = new PlateTokenUses();
    expect(uses.claim('sig', 'Pancakes', T0 + 500, T0)).toBe(true);
    expect(uses.claim('sig', 'Pancakes', T0 + 500, T0 + 1)).toBe(false);
  });

  it('treats other titles and other tokens independently', () => {
    const uses = new PlateTokenUses();
    expect(uses.claim('sig', 'Pancakes', T0 + 500, T0)).toBe(true);
    expect(uses.claim('sig', 'Crepes', T0 + 500, T0)).toBe(true);
    expect(uses.claim('other', 'Pancakes', T0 + 500, T0)).toBe(true);
  });

  it('ignores surrounding whitespace in the title', () => {
    const uses = new PlateTokenUses();
    expect(uses.claim('sig', 'Pancakes', T0 + 500, T0)).toBe(true);
    expect(uses.claim('sig', '  Pancakes ', T0 + 500, T0)).toBe(false);
  });

  it('lets a released use be claimed again', () => {
    const uses = new PlateTokenUses();
    uses.claim('sig', 'Pancakes', T0 + 500, T0);
    uses.release('sig', 'Pancakes');
    expect(uses.claim('sig', 'Pancakes', T0 + 500, T0)).toBe(true);
  });

  it('refuses after 3 attempts in total, even when each one failed', () => {
    const uses = new PlateTokenUses();
    for (let i = 0; i < 3; i++) {
      expect(uses.claim('sig', 'Pancakes', T0 + 500, T0)).toBe(true);
      uses.release('sig', 'Pancakes');
    }
    expect(uses.claim('sig', 'Pancakes', T0 + 500, T0)).toBe(false);
  });

  it('prunes entries once their token has expired', () => {
    const uses = new PlateTokenUses();
    uses.claim('sig', 'Pancakes', T0 + 500, T0);
    uses.claim('sig', 'Crepes', T0 + 900, T0);
    uses.claim('sig2', 'Tea', T0 + 5000, T0 + 1000);
    expect(uses.size).toBe(1);
  });
});
