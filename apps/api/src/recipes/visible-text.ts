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

/** A letter, digit or "-" (so `<nav-bar>` is a custom element, not `<nav>`). */
const isNameChar = (code: number) =>
  (code >= 97 && code <= 122) || (code >= 48 && code <= 57) || code === 45;

/** Where `</name` closes an element: not a longer name (`</header` is not `</head`). -1 when there is none. */
function findClose(lower: string, name: string, from: number): number {
  const needle = `</${name}`;
  for (let at = lower.indexOf(needle, from); at !== -1;) {
    if (!isNameChar(lower.charCodeAt(at + needle.length))) return at;
    at = lower.indexOf(needle, at + 1);
  }
  return -1;
}

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
  const cut = out.slice(0, limit);
  // Do not end on half of a surrogate pair.
  const last = cut.charCodeAt(cut.length - 1);
  return last >= 0xd800 && last <= 0xdbff ? cut.slice(0, -1) : cut;
}

export function visibleText(html: string): string {
  const lower = asciiLower(html);
  const chunks: string[] = [];
  /** Names with no closing tag anywhere ahead, so nobody searches for one again. */
  const unclosed = new Set<string>();
  let noMoreTagEnds = false;
  /** Open `<article>` / `<main>`: a `<header>` or `<footer>` inside holds the recipe's own title, so it is kept. */
  let contentDepth = 0;
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
      if (isSlash && (name === 'article' || name === 'main')) {
        contentDepth = Math.max(0, contentDepth - 1);
      }
      chunks.push(BLOCK.has(name) ? '\n' : ' ');
      continue;
    }
    if (name === 'article' || name === 'main') contentDepth++;
    // HTML ignores a "/" on every dropped element but svg.
    const selfClosing = name === 'svg' && lower.charCodeAt(gt - 1) === 47;
    const keptHere =
      (name === 'header' || name === 'footer') && contentDepth > 0;
    // A same-name element nested in a dropped one (`<aside><aside>a</aside>LEAK</aside>`)
    // ends at the first close and leaks its tail: the accepted cost of staying linear without a parser.
    if (DROPPED.has(name) && !selfClosing && !keptHere) {
      const close = unclosed.has(name) ? -1 : findClose(lower, name, gt + 1);
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
