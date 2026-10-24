import { Box, Link, Typography } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { languageName } from '../lib/languageName';

/** The host of a link without a leading `www.`, or null when it is not a URL. */
export function sourceHost(sourceLink: string): string | null {
  try {
    return new URL(sourceLink).hostname.replace(/^www\./, '') || null;
  } catch {
    return null;
  }
}

/** Whether the text is an http(s) address with a host, so it can be shown as a link. */
export function isSourceLink(href: string): boolean {
  return /^https?:/i.test(href) && sourceHost(href) !== null;
}

/** "From host ↗": where a Recipe was read from (its Source Link), opening the page in a new tab, with "Translated from French" beside it when the page was in another language. */
export function SourceLink({
  href,
  translatedFrom,
}: {
  href: string;
  /** Language code of the page, when the Recipe was translated from it. */
  translatedFrom?: string | null;
}) {
  const { t, i18n } = useTranslation('recipes');
  const host = sourceHost(href);
  // Only an http(s) page is linked; anything else is not shown as a link.
  if (host === null || !/^https?:/i.test(href)) return null;
  const link = (
    <Link href={href} target="_blank" rel="noopener noreferrer">
      {t('sourceLink.from', { host })}
    </Link>
  );
  if (!translatedFrom) return link;
  return (
    <Box component="span">
      {link}
      <Typography component="span" variant="meta" color="text.secondary">
        <span aria-hidden>{' · '}</span>
        {t('sourceLink.translatedFrom', {
          language: languageName(translatedFrom, i18n.resolvedLanguage ?? 'en'),
        })}
      </Typography>
    </Box>
  );
}
