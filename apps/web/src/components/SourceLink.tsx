import { Link } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';

/** The host of a link without a leading `www.`, or null when it is not a URL. */
export function sourceHost(sourceLink: string): string | null {
  try {
    return new URL(sourceLink).hostname.replace(/^www\./, '') || null;
  } catch {
    return null;
  }
}

/** "From host ↗": where a Recipe was read from (its Source Link), opening the page in a new tab. */
export function SourceLink({ href }: { href: string }) {
  const { t } = useTranslation('recipes');
  const host = sourceHost(href);
  // Only an http(s) page is linked; anything else is not shown as a link.
  if (host === null || !/^https?:/i.test(href)) return null;
  return (
    <Link href={href} target="_blank" rel="noopener noreferrer">
      {t('sourceLink.from', { host })}
    </Link>
  );
}
