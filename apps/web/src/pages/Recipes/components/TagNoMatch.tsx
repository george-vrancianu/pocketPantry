import { Box, displayType, radius, tokens } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import {
  pickedTags,
  relaxSteps,
  useTagScope,
  useTagsOnly,
} from '../../../lib/tagFilter';
import { useRecipeFilters, type RecipeBrowse } from '../../../lib/recipes';

type Props = {
  browse: RecipeBrowse;
  onChange: (next: RecipeBrowse) => void;
  scope: 'family' | 'catalog';
  showHidden: boolean;
};

/**
 * No Recipe has every picked Tag (and matches the text): says so and offers "Without {Tag} n"
 * for each Tag and for the text, each with how many Recipes it would show (docs/handoffs/tags-filter
 * section 6). A button whose count is 0 is disabled.
 */
export function TagNoMatch({ browse, onChange, scope, showHidden }: Props) {
  const { t } = useTranslation('recipes');
  const options = useRecipeFilters(true, scope).data?.tags ?? [];
  const searching = browse.search.trim() !== '';
  const inScope = useTagScope(browse, { scope, showHidden, enabled: true });
  const tagsOnly = useTagsOnly(browse, {
    scope,
    showHidden,
    enabled: searching,
  });
  const picked = pickedTags(options, browse.tagIds);
  const steps = relaxSteps(
    inScope.data?.recipes ?? [],
    browse.tagIds,
    browse.search,
    tagsOnly.data?.recipes.length,
  );
  const title = t('tags.noMatch', { count: browse.tagIds.length });
  return (
    <Box sx={{ textAlign: 'center', pt: '30px', pb: '10px', px: '4px' }}>
      <Box sx={{ ...displayType, fontSize: 18 }}>
        {searching
          ? `${title} ${t('tags.noMatchQuery', { q: browse.search.trim() })}`
          : title}
      </Box>
      <Box sx={{ fontSize: 14, color: tokens.color.muted, mt: '4px' }}>
        {t('tags.tryWithout')}
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '8px',
          mt: '14px',
        }}
      >
        {steps.map((step) => {
          const name =
            step.kind === 'tag'
              ? (picked.find((tag) => tag.id === step.tagId)?.name ?? '')
              : '';
          return (
            <Box
              key={step.kind === 'tag' ? step.tagId : 'search'}
              component="button"
              type="button"
              disabled={step.count === 0}
              onClick={() =>
                onChange(
                  step.kind === 'tag'
                    ? {
                        ...browse,
                        tagIds: browse.tagIds.filter((id) => id !== step.tagId),
                      }
                    : { ...browse, search: '' },
                )
              }
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                height: 36,
                px: '12px',
                borderRadius: radius.chip,
                border: `1px solid ${tokens.color.line}`,
                bgcolor: tokens.color.surface,
                color: tokens.color.ink,
                font: 'inherit',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                '&:disabled': { opacity: 0.42, cursor: 'default' },
              }}
            >
              {step.kind === 'tag'
                ? t('tags.without', { name })
                : t('tags.withoutQuery', { q: browse.search.trim() })}
              <Box
                component="span"
                sx={{
                  minWidth: 20,
                  height: 20,
                  px: '6px',
                  boxSizing: 'border-box',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '999px',
                  bgcolor: tokens.color.accentTint,
                  color: tokens.color.accentOnTint,
                  fontSize: 11.5,
                  fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {step.count}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
