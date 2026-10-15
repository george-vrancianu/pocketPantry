import {
  Box,
  ClockIcon,
  IngredientsScanIcon,
  tokens,
  color,
  displayType,
  radius,
} from '@pocket-pantry/ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { CookTonightCard } from '../../../lib/cookTonight';
import {
  AllergenIndicator,
  allergenIndicatorLabel,
} from '../../../components/AllergenIndicator';
import { totalMinutes } from '../../../lib/recipes';
import { bleedSx } from './bleed';
import { SectionLabel } from './SectionLabel';

/** "You can make this": a carousel of tiles for the Recipes the Family Can Make tonight. */
export function CanMakeStrip({ cards }: { cards: CookTonightCard[] }) {
  const { t } = useTranslation('recipes');
  const labelId = useId();
  return (
    <Box component="section" aria-labelledby={labelId}>
      <SectionLabel
        id={labelId}
        end={
          <Box
            component={Link}
            to="/pantry"
            sx={{
              fontSize: 13,
              fontWeight: 700,
              color: tokens.color.accent,
              textDecoration: 'none',
            }}
          >
            {t('fromYourPantry')}
          </Box>
        }
      >
        {t('canMakeThis')}
      </SectionLabel>
      <Box
        sx={{
          ...bleedSx,
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          pt: '4px',
          pb: '6px',
        }}
      >
        {cards.map((card) => (
          <Tile key={card.base.id} card={card} />
        ))}
      </Box>
    </Box>
  );
}

function Tile({ card }: { card: CookTonightCard }) {
  const { t } = useTranslation('recipes');
  const { recipe } = card;
  const minutes = totalMinutes(recipe);
  const timeText = minutes === null ? null : t('minutes', { count: minutes });
  const note =
    card.expiringCount > 0
      ? t('expiring', { count: card.expiringCount })
      : card.otherVariantsCount > 0
        ? t('otherVariants', { count: card.otherVariantsCount })
        : null;
  // Block children carry no spaces for a screen reader, so name the link explicitly.
  const name = [
    recipe.title,
    timeText,
    note,
    recipe.allergyWarning
      ? allergenIndicatorLabel(t, recipe.allergyWarning)
      : null,
  ]
    .filter(Boolean)
    .join(', ');
  return (
    <Box
      component={Link}
      to={`/recipes/${recipe.id}`}
      aria-label={name}
      sx={{
        flex: '0 0 196px',
        minHeight: 92,
        boxSizing: 'border-box',
        p: '12px 14px',
        borderRadius: radius.card,
        bgcolor: tokens.color.accent,
        color: color.accentInk,
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        scrollSnapAlign: 'start',
      }}
    >
      <Box
        component="span"
        sx={{
          ...displayType,
          fontSize: 17,
          lineHeight: 1.15,
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 2,
          overflow: 'hidden',
        }}
      >
        {recipe.title}
      </Box>
      <Box
        component="span"
        aria-hidden
        sx={{
          mt: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          fontSize: 12,
          minHeight: 20,
        }}
      >
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            opacity: 0.85,
          }}
        >
          {timeText ? (
            <>
              <ClockIcon size={13} />
              {timeText}
            </>
          ) : null}
        </Box>
        {card.expiringCount > 0 ? (
          <Box
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              px: '7px',
              py: '2px',
              borderRadius: radius.pill,
              bgcolor: tokens.color.urgentBg,
              color: tokens.color.urgentFg,
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            <IngredientsScanIcon size={12} />
            {note}
          </Box>
        ) : note ? (
          <Box
            component="span"
            sx={{ fontSize: 11, fontWeight: 600, opacity: 0.85 }}
          >
            {note}
          </Box>
        ) : null}
      </Box>
      {recipe.allergyWarning ? (
        <Box component="span" sx={{ mt: '6px', display: 'flex' }}>
          <AllergenIndicator warning={recipe.allergyWarning} />
        </Box>
      ) : null}
    </Box>
  );
}
