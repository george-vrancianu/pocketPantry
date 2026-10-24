/**
 * The schema.org `Recipe` of a web page, found in its JSON-LD blocks, as compact
 * JSON text for the reading prompt; null when the page has none. No HTML parser:
 * the blocks are plain `<script type="application/ld+json">` text.
 */

const SCRIPT_BLOCK = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
const LD_JSON_TYPE =
  /\btype\s*=\s*(?:"application\/ld\+json"|'application\/ld\+json'|application\/ld\+json)/i;

/** Keys that only bloat the prompt: media, reviews and ratings say nothing about the cooking. */
const BULKY_KEYS = ['image', 'video', 'review', 'comment', 'aggregateRating'];

/** The most JSON text handed to the model. */
export const MAX_JSON_LD_CHARS = 30_000;

const isRecipeType = (type: unknown): boolean => {
  const isRecipe = (value: unknown) =>
    typeof value === 'string' &&
    /^(?:(?:https?:\/\/)?schema\.org\/|schema:)?Recipe$/i.test(value.trim());
  return Array.isArray(type) ? type.some(isRecipe) : isRecipe(type);
};

function findRecipe(node: unknown, depth = 0): Record<string, unknown> | null {
  if (depth > 6 || node === null || typeof node !== 'object') return null;
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findRecipe(item, depth + 1);
      if (found) return found;
    }
    return null;
  }
  const record = node as Record<string, unknown>;
  if (isRecipeType(record['@type'])) return record;
  return findRecipe(record['@graph'], depth + 1);
}

export function extractJsonLdRecipe(html: string): string | null {
  for (const block of html.matchAll(SCRIPT_BLOCK)) {
    if (!LD_JSON_TYPE.test(block[1] ?? '')) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(block[2] ?? '');
    } catch {
      continue;
    }
    const recipe = findRecipe(parsed);
    if (!recipe) continue;
    const slim = Object.fromEntries(
      Object.entries(recipe).filter(([key]) => !BULKY_KEYS.includes(key)),
    );
    return JSON.stringify(slim).slice(0, MAX_JSON_LD_CHARS);
  }
  return null;
}
