/**
 * Values that belong to Gator's logo art, not to a Theme: the tile shape and
 * the Dark rim hold in every Theme (handoff §2, gator-finish).
 */
export const LOGO_DARK_RIM = '#9FD36A';

/** The tile's corner radius: rx 44 of 188 in the 200 viewBox. */
export const logoTileRadius = (size: number) => `${(size * 44) / 200}px`;
