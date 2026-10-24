/**
 * The schema.org `Recipe` of a web page, found in its JSON-LD blocks, as compact
 * JSON text for the reading prompt; null when the page has none. No HTML parser:
 * the blocks are plain `<script type="application/ld+json">` text.
 */

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
  for (const key of ['@graph', 'mainEntity', 'mainEntityOfPage']) {
    const found = findRecipe(record[key], depth + 1);
    if (found) return found;
  }
  return null;
}

/** ASCII-only lower-casing, so indexes in the copy are indexes in the original. */
const asciiLower = (text: string) =>
  text.replace(/[A-Z]/g, (c) => c.toLowerCase());

/**
 * The (attributes, body) of each `<script>` block, in one linear pass: every
 * search moves forward, and an unclosed tag ends the scan instead of being
 * retried from each later tag.
 */
function* scriptBlocks(html: string): Generator<[string, string]> {
  const lower = asciiLower(html);
  let from = 0;
  for (;;) {
    const open = lower.indexOf('<script', from);
    if (open === -1) return;
    const attrsStart = open + '<script'.length;
    if (!/[\s>/]/.test(lower[attrsStart] ?? '')) {
      from = attrsStart;
      continue;
    }
    const tagEnd = lower.indexOf('>', attrsStart);
    if (tagEnd === -1) return;
    const close = lower.indexOf('</script', tagEnd + 1);
    if (close === -1) return;
    yield [html.slice(attrsStart, tagEnd), html.slice(tagEnd + 1, close)];
    from = close + '</script'.length;
  }
}

export function extractJsonLdRecipe(html: string): string | null {
  for (const [attributes, body] of scriptBlocks(html)) {
    if (!LD_JSON_TYPE.test(attributes)) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(body);
    } catch {
      continue;
    }
    // A hostile block (deeply nested arrays) can overflow the stack here: skip it, never 500.
    try {
      const recipe = findRecipe(parsed);
      if (!recipe) continue;
      const slim = Object.fromEntries(
        Object.entries(recipe).filter(([key]) => !BULKY_KEYS.includes(key)),
      );
      return JSON.stringify(slim).slice(0, MAX_JSON_LD_CHARS);
    } catch {
      continue;
    }
  }
  return null;
}
