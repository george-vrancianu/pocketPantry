import {
  Box,
  CheckIcon,
  ChevronRightIcon,
  IngredientsScanIcon,
  WarningIcon,
  tokens,
  displayType,
  radius,
} from '@pocket-pantry/ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { CookTonightCard } from '../../../lib/cookTonight';
import { totalMinutes, type RecipeListItem } from '../../../lib/recipes';
import { OwnerBadge } from './OwnerBadge';

type Props = {
  recipe: RecipeListItem;
  /** The Recipe's cook-tonight card, when it has one. */
  card: CookTonightCard | undefined;
  /** Variants are labelled with their Base Recipe only while a search or filter is active. */
  filtering: boolean;
};

/** A list row: title, meta and status pills on the left, total time and a chevron on the right. */
export function RecipeRow({ recipe, card, filtering }: Props) {
  const { t } = useTranslation('recipes');
  const minutes = totalMinutes(recipe);
  const meta = [
    recipe.cuisine?.name,
    recipe.method?.name,
    recipe.difficulty ? t(`difficulty.${recipe.difficulty}`) : null,
    recipe.variantCount > 0
      ? t('variantCount', { count: recipe.variantCount })
      : null,
  ].filter(Boolean);
  return (
    <Box
      component="li"
      sx={{ '& + &': { borderTop: `1px solid ${tokens.color.line}` } }}
    >
      <Box
        component={Link}
        to={`/recipes/${recipe.id}`}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minHeight: 66,
          boxSizing: 'border-box',
          p: '12px 4px',
          color: tokens.color.ink,
          textDecoration: 'none',
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ fontSize: 15, fontWeight: 700 }}>
            {recipe.title} <OwnerBadge owner={recipe.owner} />
          </Box>
          {filtering && recipe.base ? (
            <Box
              sx={{ fontSize: 13, fontWeight: 600, color: tokens.color.accent }}
            >
              {t('variantOf', { base: recipe.base.title })}
            </Box>
          ) : null}
          {meta.length > 0 ? (
            <Box
              sx={{ fontSize: 13, fontWeight: 500, color: tokens.color.muted }}
            >
              {meta.join(' · ')}
            </Box>
          ) : null}
          {card ? <StatusPills recipeId={recipe.id} card={card} /> : null}
        </Box>
        <Box
          sx={{
            textAlign: 'right',
            fontVariantNumeric: 'tabular-nums',
            flexShrink: 0,
          }}
        >
          {minutes === null ? (
            <Box
              sx={{
                fontSize: 11,
                fontWeight: 600,
                color: tokens.color.muted,
              }}
            >
              —
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  ...displayType,
                  fontSize: 17,
                }}
              >
                {minutes}
              </Box>
              <Box
                sx={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: tokens.color.muted,
                }}
              >
                {t('minutesShort')}
              </Box>
            </>
          )}
        </Box>
        <Box aria-hidden sx={{ display: 'flex', color: tokens.color.muted }}>
          <ChevronRightIcon size={16} />
        </Box>
      </Box>
    </Box>
  );
}

function StatusPills({
  recipeId,
  card,
}: {
  recipeId: string;
  card: CookTonightCard;
}) {
  const { t } = useTranslation('recipes');
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '6px', mt: '6px' }}>
      {card.canMake ? (
        <Pill
          icon={<CheckIcon size={13} />}
          fg={tokens.color.accent}
          bg={tokens.color.accentTint}
        >
          {card.recipe.id === recipeId
            ? t('canMake')
            : t('canMakeVia', { title: card.recipe.title })}
        </Pill>
      ) : card.missing ? (
        <Pill
          icon={<WarningIcon size={13} />}
          fg={tokens.color.soonFg}
          bg={tokens.color.soonBg}
        >
          {t('missingOne', { name: card.missing.name })}
        </Pill>
      ) : null}
      {card.expiringCount > 0 ? (
        <Pill
          icon={<IngredientsScanIcon size={13} />}
          fg={tokens.color.urgentFg}
          bg={tokens.color.urgentBg}
        >
          {t('expiring', { count: card.expiringCount })}
        </Pill>
      ) : null}
    </Box>
  );
}

function Pill(props: {
  icon: ReactNode;
  fg: string;
  bg: string;
  children: ReactNode;
}) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        px: '8px',
        py: '3px',
        borderRadius: radius.pill,
        bgcolor: props.bg,
        color: props.fg,
        fontSize: 12,
        fontWeight: 700,
        lineHeight: 1.2,
      }}
    >
      {props.icon}
      {props.children}
    </Box>
  );
}
