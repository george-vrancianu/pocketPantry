import { Box, RecipesIcon, tokens, radius } from '@pocket-pantry/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  AllergenIndicator,
  allergenIndicatorLabel,
} from '../../../components/AllergenIndicator';
import { HiddenByAllergiesNote } from '../../../components/HiddenByAllergiesNote';
import { translateApiError } from '../../../i18n/translateApiError';
import { useCookTonight, type CookTonightCard } from '../../../lib/cookTonight';
import type { WidgetSize } from '../../../lib/dashboard';
import { widgetSpan, type GridColumns } from '../../../lib/layoutColumns';
import { localIso } from '../../../lib/pantry';
import { WidgetCard, WidgetTitle } from './WidgetCard';
import type { WidgetProps } from './types';

/**
 * How many cards a Widget has room for; the API ranks them, the Widget only cuts.
 * Cards are about 70 px tall: a small or wide Widget fits one or two, a tall one
 * (two rows, four-column grid only) three.
 */
function cardsFor(size: WidgetSize, columns: GridColumns): number {
  const { columns: span, rows } = widgetSpan(size, columns);
  if (size === 'small') return 1;
  return rows === 2 && span === 2 ? 3 : 2;
}

/** Cards for the Recipes the Family can make tonight (or nearly), one per Base Recipe. */
export function CookTonightWidget({ size, columns }: WidgetProps) {
  const { t, i18n } = useTranslation('dashboard');
  const [showHidden, setShowHidden] = useState(false);
  const cookTonight = useCookTonight(
    i18n.language,
    // oxlint-disable-next-line react/purity -- "today" must follow the clock across midnight; freezing it would leave a Member on a stale day
    localIso(new Date()),
    showHidden,
  );
  const cards = (cookTonight.data?.cards ?? []).slice(
    0,
    cardsFor(size, columns),
  );

  return (
    <WidgetCard
      label={t('widgets.cookTonight.title')}
      size={size}
      columns={columns}
      isLoading={cookTonight.isPending}
      error={cookTonight.error ? translateApiError(t, cookTonight.error) : null}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: '6px',
        }}
      >
        <WidgetTitle icon={<RecipesIcon size={16} />}>
          {t('widgets.cookTonight.title')}
        </WidgetTitle>
        <Box
          component={Link}
          to="/recipes"
          sx={{
            fontSize: 13,
            fontWeight: 700,
            color: tokens.color.accent,
            textDecoration: 'none',
          }}
        >
          {t('widgets.cookTonight.seeAll')}
        </Box>
      </Box>
      <HiddenByAllergiesNote
        count={cookTonight.data?.hiddenByAllergiesCount ?? 0}
        onShow={() => setShowHidden(true)}
      />
      {cards.length === 0 ? (
        <Box sx={{ fontSize: 14, color: tokens.color.muted, py: '10px' }}>
          {t('widgets.cookTonight.empty')}
        </Box>
      ) : (
        <Box
          component="ul"
          sx={{
            listStyle: 'none',
            m: 0,
            p: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {cards.map((card) => (
            <li key={card.base.id}>
              <CookCard card={card} />
            </li>
          ))}
        </Box>
      )}
    </WidgetCard>
  );
}

function CookCard({ card }: { card: CookTonightCard }) {
  const { t } = useTranslation('dashboard');
  const { base, recipe } = card;
  // An archived base is never the suggestion: it titles the card, the Variant is secondary.
  const heading = base.archived ? base.title : recipe.title;
  const secondary = base.archived
    ? recipe.title
    : recipe.parentId
      ? t('recipes:variantOf', { base: base.title })
      : null;
  const minutes =
    recipe.prepMinutes === null && recipe.cookMinutes === null
      ? null
      : (recipe.prepMinutes ?? 0) + (recipe.cookMinutes ?? 0);
  const missing = card.missing
    ? t('widgets.cookTonight.missing', { name: card.missing.name })
    : null;
  const meta = [
    minutes === null ? null : t('recipes:minutes', { count: minutes }),
    card.expiringCount > 0
      ? t('widgets.cookTonight.expiring', { count: card.expiringCount })
      : null,
    card.otherVariantsCount > 0
      ? t('widgets.cookTonight.otherVariants', {
          count: card.otherVariantsCount,
        })
      : null,
  ].filter((part) => part !== null);
  // Block elements carry no spaces for a screen reader, so name the link explicitly.
  const allergy = recipe.allergyWarning
    ? allergenIndicatorLabel(t, recipe.allergyWarning)
    : null;
  const name = [heading, secondary, missing, meta.join(' · '), allergy]
    .filter(Boolean)
    .join(', ');

  return (
    <Box
      component={Link}
      to={`/recipes/${recipe.id}`}
      aria-label={name}
      sx={{
        display: 'block',
        p: '8px 10px',
        borderRadius: radius.control,
        border: `1px solid ${tokens.color.line}`,
        color: tokens.color.ink,
        textDecoration: 'none',
      }}
    >
      <Box
        component="span"
        sx={{
          display: 'block',
          fontSize: 14,
          fontWeight: 700,
          lineHeight: 1.3,
        }}
      >
        {heading}
      </Box>
      {secondary && (
        <Box component="span" sx={line}>
          {secondary}
        </Box>
      )}
      {missing && (
        <Box
          component="span"
          sx={{ ...line, color: tokens.color.ink, fontWeight: 600 }}
        >
          {missing}
        </Box>
      )}
      {meta.length > 0 && (
        <Box component="span" sx={line}>
          {meta.join(' · ')}
        </Box>
      )}
      {recipe.allergyWarning && (
        <Box component="span" sx={{ display: 'flex', mt: '4px' }}>
          <AllergenIndicator warning={recipe.allergyWarning} />
        </Box>
      )}
    </Box>
  );
}

const line = {
  display: 'block',
  fontSize: 12,
  color: tokens.color.muted,
} as const;
