import { Box, WarningIcon, radius, tokens } from '@pocket-pantry/ui';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import type { CompactAllergyWarning } from '../lib/recipes';

/** The warning as phrases: strong Allergens first, then the ones only in optional lines. */
function phrases(t: TFunction, warning: CompactAllergyWarning): string[] {
  const named = (severity: 'strong' | 'soft') =>
    warning.allergens
      .filter((a) => a.severity === severity)
      .map((a) => a.name)
      .join(', ');
  const strong = named('strong');
  const optional = named('soft');
  return [
    strong
      ? t('allergyIndicator.strong', { names: strong, ns: 'recipes' })
      : '',
    optional
      ? t('allergyIndicator.optional', { names: optional, ns: 'recipes' })
      : '',
  ].filter(Boolean);
}

/**
 * What a screen reader hears for a compact Allergy Warning: the Allergens by name, each as
 * required ("Contains") or optional ("Optional: contains"), then how many lines could not be
 * checked. Exported so a link that labels itself (a tile, a card) can include it.
 */
export function allergenIndicatorLabel(
  t: TFunction,
  warning: CompactAllergyWarning,
): string {
  return [
    ...phrases(t, warning),
    warning.uncheckedCount > 0
      ? t('allergyWarning.unchecked', {
          count: warning.uncheckedCount,
          ns: 'recipes',
        })
      : '',
  ]
    .filter(Boolean)
    .join('. ');
}

/**
 * A small allergen indicator for a Recipe in a list, strip, card or match: strong or soft as on
 * Recipe detail, named for screen readers. Renders nothing without a warning. Never implies a
 * Recipe without one is free of anything.
 */
export function AllergenIndicator({
  warning,
}: {
  warning: CompactAllergyWarning | null | undefined;
}) {
  const { t } = useTranslation('recipes');
  if (!warning) return null;
  const strong = warning.severity === 'strong';
  const label = allergenIndicatorLabel(t, warning);
  const allergenPhrases = phrases(t, warning);
  const text =
    allergenPhrases.length > 0
      ? allergenPhrases.join('; ')
      : t('allergyIndicator.unchecked');
  return (
    <Box
      component="span"
      role="img"
      aria-label={label}
      data-severity={warning.severity}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        px: '8px',
        py: '3px',
        borderRadius: radius.pill,
        bgcolor: strong ? tokens.color.urgentBg : tokens.color.soonBg,
        color: strong ? tokens.color.urgentFg : tokens.color.soonFg,
        fontSize: 12,
        fontWeight: 700,
        lineHeight: 1.2,
        maxWidth: '100%',
      }}
    >
      <WarningIcon size={13} />
      <Box
        component="span"
        aria-hidden
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </Box>
    </Box>
  );
}
