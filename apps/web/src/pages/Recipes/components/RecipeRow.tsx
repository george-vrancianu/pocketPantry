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
  /** Choose the Recipe instead of opening it, as the Meal plan's Recipe picker does. */
  onSelect?: () => void;
};

/** A list row: title, meta and status pills on the left, total time and a chevron on the right. */
export function RecipeRow({ recipe, card, filtering, onSelect }: Props) {
  const { t } = useTranslation('recipes');
  const meta = [
    recipe.cuisine?.name,
    recipe.method?.name,
    recipe.difficulty ? t(`difficulty.${recipe.difficulty}`) : null,
    recipe.variantCount > 0
      ? t('variantCount', { count: recipe.variantCount })
      : null,
  ].filter((part): part is string => Boolean(part));
  return (
    <RecipeRowLayout
      title={
        <>
          {recipe.title} <OwnerBadge owner={recipe.owner} />
        </>
      }
      above={
        filtering && recipe.base ? (
          <Box
            sx={{ fontSize: 13, fontWeight: 600, color: tokens.color.accent }}
          >
            {t('variantOf', { base: recipe.base.title })}
          </Box>
        ) : null
      }
      meta={meta}
      minutes={totalMinutes(recipe)}
      pills={card ? <StatusPills recipeId={recipe.id} card={card} /> : null}
      to={onSelect ? undefined : `/recipes/${recipe.id}`}
      onClick={onSelect}
    />
  );
}

type LayoutProps = {
  title: ReactNode;
  /** A line between the title and the meta. */
  above?: ReactNode;
  meta: string[];
  minutes: number | null;
  pills?: ReactNode;
  /** Makes the row a link... */
  to?: string;
  /** ...or a button; with neither, a plain row. */
  onClick?: () => void;
  dimmed?: boolean;
  'aria-label'?: string;
};

/** The row's look, for a Recipe in a list and for a Recipe in a Meal plan's slot. */
export function RecipeRowLayout({
  title,
  above,
  meta,
  minutes,
  pills,
  to,
  onClick,
  dimmed,
  'aria-label': ariaLabel,
}: LayoutProps) {
  const { t } = useTranslation('recipes');
  const inner = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minHeight: 66,
    boxSizing: 'border-box',
    p: '12px 4px',
    color: tokens.color.ink,
    textDecoration: 'none',
    opacity: dimmed ? 0.55 : 1,
    ...(to === undefined && onClick === undefined ? {} : { cursor: 'pointer' }),
  } as const;
  const content = (
    <>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ fontSize: 15, fontWeight: 700 }}>{title}</Box>
        {above}
        {meta.length > 0 ? (
          <Box
            sx={{ fontSize: 13, fontWeight: 500, color: tokens.color.muted }}
          >
            {meta.join(' · ')}
          </Box>
        ) : null}
        {pills}
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
            sx={{ fontSize: 11, fontWeight: 600, color: tokens.color.muted }}
          >
            —
          </Box>
        ) : (
          <>
            <Box sx={{ ...displayType, fontSize: 17 }}>{minutes}</Box>
            <Box
              sx={{ fontSize: 11, fontWeight: 600, color: tokens.color.muted }}
            >
              {t('minutesShort')}
            </Box>
          </>
        )}
      </Box>
      {to !== undefined || onClick !== undefined ? (
        <Box aria-hidden sx={{ display: 'flex', color: tokens.color.muted }}>
          <ChevronRightIcon size={16} />
        </Box>
      ) : null}
    </>
  );
  return (
    <Box
      component="li"
      sx={{ '& + &': { borderTop: `1px solid ${tokens.color.line}` } }}
    >
      {to !== undefined ? (
        <Box component={Link} to={to} sx={inner}>
          {content}
        </Box>
      ) : onClick !== undefined ? (
        <Box
          component="button"
          type="button"
          aria-label={ariaLabel}
          onClick={onClick}
          sx={{
            ...inner,
            width: '100%',
            border: 0,
            bgcolor: 'transparent',
            font: 'inherit',
            textAlign: 'left',
          }}
        >
          {content}
        </Box>
      ) : (
        <Box sx={inner}>{content}</Box>
      )}
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
          fg={tokens.color.accentOnTint}
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
