import { z } from 'zod';

/** The longest Source Link stored or accepted. */
export const MAX_SOURCE_LINK_LENGTH = 2048;

/** Query parameters that only track where a visitor came from, matched case-insensitively; `utm_*` is dropped too. */
export const TRACKING_PARAMS: ReadonlySet<string> = new Set([
  'fbclid',
  'gclid',
  'dclid',
  'gbraid',
  'wbraid',
  'msclkid',
  'yclid',
  'mc_cid',
  'mc_eid',
  'igshid',
  'ref_src',
  '_ga',
  '_gl',
]);

const isTracking = (key: string) => {
  const lower = key.toLowerCase();
  return lower.startsWith('utm_') || TRACKING_PARAMS.has(lower);
};

/**
 * The Source Link of a Recipe from Link: the page's address in one canonical
 * form, or null when it is not an http(s) URL: host lower-cased (the URL parser does),
 * fragment and tracking parameters dropped, the other parameters kept in their order.
 * Used both when a link is stored and when it is compared (the "Already in your Recipes" check).
 */
export function normaliseSourceLink(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  if (url.hostname === '') return null;
  url.hash = '';
  // Rebuilt only when something was dropped, so a link's other parameters keep their exact spelling.
  if ([...url.searchParams.keys()].some(isTracking)) {
    const kept = [...url.searchParams].filter(([key]) => !isTracking(key));
    url.search = new URLSearchParams(kept).toString();
  }
  const normalised = url.toString();
  return normalised.length <= MAX_SOURCE_LINK_LENGTH ? normalised : null;
}

/** A Source Link in a request body: validated and replaced by its normalised form. */
export const sourceLinkInput = z
  .string()
  .max(MAX_SOURCE_LINK_LENGTH)
  .transform((value, ctx) => {
    const normalised = normaliseSourceLink(value);
    if (normalised === null) {
      ctx.addIssue({ code: 'custom', message: 'not an http(s) link' });
      return z.NEVER;
    }
    return normalised;
  });
