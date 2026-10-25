import {
  BranchIcon,
  Box,
  Link,
  Stack,
  Typography,
  tokens,
  displayType,
  radius,
} from '@pocket-pantry/ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { totalMinutes, type RecipeDetail } from '../../../lib/recipes';
import { catalogRecipeHref } from '../../../lib/catalogRecipeHref';
import { InFamilyPill } from './InFamilyPill';
import { OwnerBadge } from './OwnerBadge';

/** The Recipe's eyebrow (Base Recipe link), title with Family pill, fact cells and archived notice. */
export function RecipeHero({
  recipe,
  servings,
  preview,
}: {
  recipe: RecipeDetail;
  servings: number;
  /** A Catalog Recipe's preview: its own eyebrow, and the "In your Recipes" pill once added. */
  preview?: { inFamily: boolean };
}) {
  const { t } = useTranslation('recipes');
  const minutes = totalMinutes(recipe);
  const style = [recipe.cuisine?.name, recipe.method?.name].filter(Boolean);
  const facts: { label: string; value: ReactNode; wide?: boolean }[] = [
    ...(minutes === null
      ? []
      : [
          {
            label: t('facts.time'),
            value: t('minutes', { count: minutes }),
          },
        ]),
    { label: t('facts.serves'), value: servings },
    ...(recipe.difficulty
      ? [
          {
            label: t('facts.level'),
            value: t(`difficulty.${recipe.difficulty}`),
          },
        ]
      : []),
    ...(style.length > 0
      ? [
          {
            label: t('facts.style'),
            value: style.map((part, index) => (
              <span key={index}>
                {index > 0 ? <br /> : null}
                {part}
              </span>
            )),
            wide: true,
          },
        ]
      : []),
  ];
  return (
    <Stack spacing={1.5}>
      <Box>
        {preview && !recipe.base ? (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '.04em',
              textTransform: 'uppercase',
              color: tokens.color.muted,
            }}
          >
            {t('preview.eyebrow')}
          </Box>
        ) : null}
        {recipe.base ? (
          <Link
            href={
              preview
                ? catalogRecipeHref(recipe.base.id, null)
                : `/recipes/${recipe.base.id}`
            }
            underline="none"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '.04em',
              textTransform: 'uppercase',
              color: tokens.color.accent,
            }}
          >
            <BranchIcon size={14} />
            {t('variantOf', { base: recipe.base.title })}
          </Link>
        ) : null}
        <Typography
          variant="h1"
          sx={{
            mt: '4px',
            ...displayType,
            fontSize: 28,
            letterSpacing: '-.02em',
            lineHeight: 1.08,
          }}
        >
          {recipe.title}{' '}
          {preview ? (
            preview.inFamily ? (
              <InFamilyPill />
            ) : null
          ) : (
            <OwnerBadge owner={recipe.owner} />
          )}
        </Typography>
      </Box>
      <Box
        component="dl"
        sx={{
          display: 'grid',
          gridTemplateColumns: facts
            .map((fact) => (fact.wide ? '1.7fr' : '1fr'))
            .join(' '),
          gap: '8px',
          m: 0,
        }}
      >
        {facts.map(({ label, value, wide }) => (
          <Box
            key={label}
            sx={{
              bgcolor: tokens.color.surface,
              border: `1px solid ${tokens.color.line}`,
              borderRadius: radius.control,
              px: '6px',
              py: '8px',
              textAlign: 'center',
              minWidth: 0,
            }}
          >
            <Box
              component="dt"
              sx={{
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: '.05em',
                textTransform: 'uppercase',
                color: tokens.color.muted,
              }}
            >
              {label}
            </Box>
            <Box
              component="dd"
              sx={{
                m: 0,
                mt: '2px',
                ...displayType,
                fontSize: wide ? 13 : 17,
                lineHeight: wide ? 1.2 : undefined,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {value}
            </Box>
          </Box>
        ))}
      </Box>
      {recipe.archived ? (
        <Typography color="text.secondary">{t('archived')}</Typography>
      ) : null}
    </Stack>
  );
}
