import { Box } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import type { UnmatchedEntry } from '../../../lib/unmatched';

/** "3 rows · Receipt, Typed", then "Printed: SMANTANA 20% 400G" when the rows carry printed text. */
export function UnmatchedMeta({ entry }: { entry: UnmatchedEntry }) {
  const { t, i18n } = useTranslation('admin');
  const sources = entry.sources
    .map((source) => t(`unmatched.sources.${source}`))
    .sort((a, b) => a.localeCompare(b, i18n.language))
    .join(', ');
  return (
    <>
      {t('review.rowMeta', {
        rows: t('unmatched.rows', { count: entry.count }),
        sources,
      })}
      {entry.sourceText ? (
        <Box component="span" sx={{ display: 'block' }}>
          {entry.sourceLanguage
            ? t('unmatched.printedIn', {
                text: entry.sourceText,
                language: t(`locales.${entry.sourceLanguage}`),
              })
            : t('unmatched.printed', { text: entry.sourceText })}
        </Box>
      ) : null}
    </>
  );
}
