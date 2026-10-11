import { Box, RecipesIcon, tokens } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { translateApiError } from '../../../i18n/translateApiError';
import { useCookTonight, type CookTonightCard } from '../../../lib/cookTonight';
import type { WidgetSize } from '../../../lib/dashboard';
import { localIso } from '../../../lib/pantry';
import { WidgetCard, WidgetTitle } from './WidgetCard';
import type { WidgetProps } from './types';

/** How many cards each size has room for; the API ranks them, the Widget only cuts. */
const CARDS_BY_SIZE: Record<WidgetSize, number> = {
  small: 1,
  wide: 2,
  tall: 4,
};

/** Cards for the Recipes the Family can make tonight (or nearly), one per Base Recipe. */
export function CookTonightWidget({ size, columns }: WidgetProps) {
  const { t, i18n } = useTranslation('dashboard');
  const cookTonight = useCookTonight(i18n.language, localIso(new Date()));
  const cards = (cookTonight.data?.cards ?? []).slice(0, CARDS_BY_SIZE[size]);

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
  const hints = [
    minutes === null ? null : t('recipes:minutes', { count: minutes }),
    card.expiringCount > 0
      ? t('widgets.cookTonight.expiring', { count: card.expiringCount })
      : null,
  ].filter((hint) => hint !== null);

  return (
    <Box
      component={Link}
      to={`/recipes/${recipe.id}`}
      sx={{
        display: 'block',
        p: '8px 10px',
        borderRadius: '10px',
        border: `1px solid ${tokens.color.line}`,
        color: tokens.color.ink,
        textDecoration: 'none',
      }}
    >
      <Box component="span" sx={{ display: 'block', fontWeight: 700 }}>
        {heading}
      </Box>
      {secondary && (
        <Box component="span" sx={line}>
          {secondary}
        </Box>
      )}
      {card.missing && (
        <Box
          component="span"
          sx={{ ...line, color: tokens.color.ink, fontWeight: 600 }}
        >
          {t('widgets.cookTonight.missing', { name: card.missing.name })}
        </Box>
      )}
      {hints.length > 0 && (
        <Box component="span" sx={line}>
          {hints.join(' · ')}
        </Box>
      )}
      {card.otherVariantsCount > 0 && (
        <Box component="span" sx={line}>
          {t('widgets.cookTonight.otherVariants', {
            count: card.otherVariantsCount,
          })}
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
