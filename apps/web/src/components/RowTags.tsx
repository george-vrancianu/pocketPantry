import { Box, TagChip, tokens } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { splitRowTags, type RecipeTag } from '../lib/tags';

type Props = {
  tags: RecipeTag[];
  /** Tags the active filter matched; they come first (#711 passes them in). */
  matchedIds?: readonly string[];
  /** Quiet text after the chips, e.g. the Level: shown as "· Easy". */
  meta?: string[];
};

/**
 * The Tags line of a Recipe row: up to two Tag chips, "+N" for the rest, then "· {meta}".
 * One labelled element names every Tag ("Tags: Dinner, Vegan, High-protein"); the chips and "+N"
 * are hidden from screen readers so the overflow is announced by name, not as a bare number.
 */
export function RowTags({ tags, matchedIds = [], meta = [] }: Props) {
  const { t } = useTranslation('recipes');
  const { shown, more } = splitRowTags(tags, matchedIds);
  const names = splitRowTags(tags, matchedIds, tags.length)
    .shown.map((tag) => tag.name)
    .join(', ');
  return (
    <Box
      role="group"
      aria-label={t('tags.rowLabel', { names })}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        mt: '5px',
        minWidth: 0,
      }}
    >
      {shown.map((tag) => (
        <TagChip
          key={tag.id}
          aria-hidden
          kind={tag.kind}
          matched={matchedIds.includes(tag.id)}
        >
          {tag.name}
        </TagChip>
      ))}
      {more > 0 ? (
        <Box
          component="span"
          aria-hidden
          sx={{
            flexShrink: 0,
            fontSize: 12,
            fontWeight: 700,
            color: tokens.color.muted,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          +{more}
        </Box>
      ) : null}
      {meta.length > 0 ? (
        <Box
          component="span"
          sx={{
            flexShrink: 0,
            fontSize: 13,
            fontWeight: 500,
            color: tokens.color.muted,
            whiteSpace: 'nowrap',
          }}
        >
          · {meta.join(' · ')}
        </Box>
      ) : null}
    </Box>
  );
}
