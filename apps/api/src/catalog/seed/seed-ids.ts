import { createHash } from 'node:crypto';

/** Deterministic UUID from a stable key, so seed rows keep their ids forever. */
export function stableId(key: string): string {
  const hex = createHash('sha1').update(`pocket-pantry:${key}`).digest('hex');
  const variant = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    `5${hex.slice(13, 16)}`,
    `${variant}${hex.slice(17, 20)}`,
    hex.slice(20, 32),
  ].join('-');
}

export const seedId = {
  aisle: (slug: string) => stableId(`aisle:${slug}`),
  parent: (slug: string) => stableId(`parent:${slug}`),
  leaf: (slug: string) => stableId(`leaf:${slug}`),
  ingredient: (slug: string) => stableId(`ingredient:${slug}`),
  recipe: (slug: string) => stableId(`recipe:${slug}`),
  cuisine: (slug: string) => stableId(`cuisine:${slug}`),
  method: (slug: string) => stableId(`method:${slug}`),
  eatingMoment: (slug: string) => stableId(`eating-moment:${slug}`),
};
