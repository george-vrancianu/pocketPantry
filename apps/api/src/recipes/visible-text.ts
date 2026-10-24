/**
 * The text a reader sees on a web page, for the reading prompt when the page has no
 * JSON-LD `Recipe`. No HTML parser and no regex over the whole page: one forward pass
 * with `indexOf`, so a hostile page (unclosed tags, thousands of `<` or `<!--`, deep
 * nesting, megabytes) costs time linear in its size. Every search moves forward, and a
 * search that found nothing is never repeated.
 */

/** The most visible text handed to the model: the JSON-LD cap, about 7,500 tokens. */
export const MAX_VISIBLE_TEXT_CHARS = 30_000;

/** Elements whose whole content is dropped. */
const DROPPED = new Set([
  'script',
  'style',
  'noscript',
  'template',
  'svg',
  'head',
  'nav',
  'header',
  'footer',
  'aside',
]);

/**
 * Dropped elements that are really code or markup: with no closing tag, the rest of the
 * page is theirs. For the others (a stray `<nav>` or `<head>`) only the tag itself goes.
 */
const RAW = new Set(['script', 'style', 'noscript', 'template', 'svg']);

/** Tags that end a line; every other tag is a space. */
const BLOCK = new Set([
  'address',
  'article',
  'blockquote',
  'br',
  'dd',
  'div',
  'dl',
  'dt',
  'fieldset',
  'figcaption',
  'figure',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'li',
  'main',
  'ol',
  'p',
  'pre',
  'section',
  'table',
  'td',
  'th',
  'tr',
  'ul',
]);

/** ASCII-only lower-casing, so indexes in the copy are indexes in the original. */
const asciiLower = (text: string) =>
  text.replace(/[A-Z]/g, (c) => c.toLowerCase());

const isNameChar = (code: number) =>
  (code >= 97 && code <= 122) || (code >= 48 && code <= 57);

const ENTITY =
  /&(?:#x([0-9a-f]{1,6})|#([0-9]{1,7})|(amp|lt|gt|quot|apos|nbsp));/gi;
const NAMED: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

function decodeEntities(text: string): string {
  if (!text.includes('&')) return text;
  return text.replace(
    ENTITY,
    (_all, hex?: string, decimal?: string, named?: string) => {
      if (named) return NAMED[named.toLowerCase()] ?? '';
      const code = hex ? parseInt(hex, 16) : parseInt(decimal ?? '', 10);
      return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff)
        ? String.fromCodePoint(code)
        : '';
    },
  );
}

/** Whitespace runs become one space (or one newline when the run holds a line break); the result is trimmed and cut to the budget. */
function collapse(text: string, limit: number): string {
  let out = '';
  let pending: '' | ' ' | '\n' = '';
  for (let i = 0; i < text.length && out.length < limit; i++) {
    const ch = text[i];
    if (ch === '\n') pending = '\n';
    else if (/\s/.test(ch)) pending ||= ' ';
    else {
      if (pending && out) out += pending;
      pending = '';
      out += ch;
    }
  }
  return out.slice(0, limit);
}

export function visibleText(html: string): string {
  const lower = asciiLower(html);
  const chunks: string[] = [];
  /** Names with no closing tag anywhere ahead, so nobody searches for one again. */
  const unclosed = new Set<string>();
  let noMoreTagEnds = false;
  let from = 0;
  let i = 0;

  while (i < html.length) {
    const lt = html.indexOf('<', i);
    if (lt === -1) break;
    const next = lower.charCodeAt(lt + 1);
    const isSlash = next === 47;
    const nameStart = lt + (isSlash ? 2 : 1);
    const first = lower.charCodeAt(nameStart);
    const startsTag = isNameChar(first) && first > 57;
    const special = next === 33 || next === 63; // <! or <?
    if (!(startsTag || special || (isSlash && isNameChar(first)))) {
      i = lt + 1; // a lone "<" is text
      continue;
    }
    chunks.push(html.slice(from, lt));

    if (special && lower.startsWith('<!--', lt)) {
      const end = lower.indexOf('-->', lt + 4);
      if (end === -1) {
        from = html.length; // an unclosed comment swallows the rest
        i = html.length;
        break;
      }
      from = i = end + 3;
      chunks.push(' ');
      continue;
    }

    if (noMoreTagEnds) {
      from = i = lt + 1; // no ">" ahead: everything left is text
      chunks.push('<');
      continue;
    }
    const gt = lower.indexOf('>', lt + 1);
    if (gt === -1) {
      noMoreTagEnds = true;
      from = i = lt + 1;
      chunks.push('<');
      continue;
    }

    let nameEnd = nameStart;
    while (isNameChar(lower.charCodeAt(nameEnd))) nameEnd++;
    const name = lower.slice(nameStart, nameEnd);
    from = i = gt + 1;

    if (special || isSlash) {
      chunks.push(BLOCK.has(name) ? '\n' : ' ');
      continue;
    }
    const selfClosing = lower.charCodeAt(gt - 1) === 47;
    if (DROPPED.has(name) && !selfClosing) {
      const close = unclosed.has(name)
        ? -1
        : lower.indexOf(`</${name}`, gt + 1);
      if (close === -1) {
        unclosed.add(name);
        if (RAW.has(name)) {
          from = i = html.length;
          break;
        }
        chunks.push(' ');
        continue;
      }
      const closeEnd = lower.indexOf('>', close);
      from = i = closeEnd === -1 ? html.length : closeEnd + 1;
      chunks.push('\n');
      continue;
    }
    chunks.push(BLOCK.has(name) ? '\n' : ' ');
  }
  chunks.push(html.slice(from));
  return collapse(decodeEntities(chunks.join('')), MAX_VISIBLE_TEXT_CHARS);
}
