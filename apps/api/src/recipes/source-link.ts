import { z } from 'zod';

/** The longest Source Link stored or accepted. */
export const MAX_SOURCE_LINK_LENGTH = 2048;

/**
 * The Source Link of a Recipe from Link: the page's address in one canonical
 * form, or null when it is not an http(s) URL. Ticket 511 lower-cases the host
 * (the URL parser does) and drops the fragment; tracking parameters are ticket 514's.
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
