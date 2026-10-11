import { Box, Link, Stack, Typography } from '@pocket-pantry/ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { DiffEntry, RecipeDetail } from '../../../lib/recipes';
import { IngredientList, lineAmount } from './IngredientList';
import { OwnerBadge } from './OwnerBadge';
import { RecipeMeta } from './RecipeMeta';
import { Section } from './Section';
import { StepList } from './StepList';

export type SectionProps = { recipe: RecipeDetail };

function IngredientsSection({ recipe }: SectionProps) {
  const { t } = useTranslation('recipes');
  return (
    <Section title={t('sections.ingredients')}>
      {/* #157: pass renderLineStatus here for the per-line Pantry status. */}
      <IngredientList
        lines={recipe.lines}
        aria-label={t('sections.ingredients')}
      />
    </Section>
  );
}

function StepsSection({ recipe }: SectionProps) {
  const { t } = useTranslation('recipes');
  if (recipe.steps.length === 0) return null;
  return (
    <Section title={t('sections.steps')}>
      <StepList
        steps={recipe.steps}
        tips={recipe.tips}
        aria-label={t('sections.steps')}
      />
    </Section>
  );
}

/** Recipe-level Tips: own and inherited. Step Tips show on their step instead. */
function TipsSection({ recipe }: SectionProps) {
  const { t } = useTranslation('recipes');
  const tips = recipe.tips.filter((tip) => tip.stepId === null);
  if (tips.length === 0) return null;
  return (
    <Section title={t('sections.tips')}>
      <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 3 }}>
        {tips.map((tip) => (
          <Box component="li" key={tip.id}>
            {tip.text}
            {tip.inherited ? (
              <Typography
                variant="meta"
                color="text.secondary"
                component="span"
              >
                {' '}
                ({t('inheritedTip')})
              </Typography>
            ) : null}
          </Box>
        ))}
      </Stack>
    </Section>
  );
}

function useEntryText() {
  const { t, i18n } = useTranslation(['recipes', 'common']);
  return (entry: DiffEntry) => {
    const amount = lineAmount(entry, i18n.language, t);
    return amount ? `${entry.ingredientName} ${amount}` : entry.ingredientName;
  };
}

function DiffGroup({ label, items }: { label: string; items: ReactNode[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <Typography variant="meta" color="text.secondary" component="p">
        {label}
      </Typography>
      <Stack component="ul" aria-label={label} sx={{ m: 0, pl: 3 }}>
        {items.map((item, index) => (
          <Box component="li" key={index}>
            {item}
          </Box>
        ))}
      </Stack>
    </div>
  );
}

/** A Variant's ingredient diff against its base. */
function WhatsDifferentSection({ recipe }: SectionProps) {
  const { t } = useTranslation('recipes');
  const entryText = useEntryText();
  const { diff, base } = recipe;
  if (!diff) return null;
  const empty =
    diff.added.length + diff.removed.length + diff.swapped.length === 0;
  return (
    <Section title={t('sections.whatsDifferent')}>
      <Stack spacing={1}>
        {empty ? (
          <Typography color="text.secondary">
            {t('diff.none', { base: base?.title ?? '' })}
          </Typography>
        ) : null}
        <DiffGroup label={t('diff.added')} items={diff.added.map(entryText)} />
        <DiffGroup
          label={t('diff.removed')}
          items={diff.removed.map(entryText)}
        />
        <DiffGroup
          label={t('diff.swapped')}
          items={diff.swapped.map((swap) =>
            t('diff.swap', {
              from: entryText(swap.from),
              to: entryText(swap.to),
            }),
          )}
        />
      </Stack>
    </Section>
  );
}

/** A base Recipe's Variants with their Cuisine and Method. */
function VariantsSection({ recipe }: SectionProps) {
  const { t } = useTranslation('recipes');
  if (recipe.parentId !== null) return null;
  return (
    <Section title={t('sections.variants')}>
      {recipe.variants.length === 0 ? (
        <Typography color="text.secondary">{t('noVariants')}</Typography>
      ) : (
        <Stack
          component="ul"
          spacing={1}
          sx={{ listStyle: 'none', m: 0, p: 0 }}
        >
          {recipe.variants.map((variant) => (
            <Box component="li" key={variant.id}>
              <Link href={`/recipes/${variant.id}`}>{variant.title}</Link>{' '}
              <OwnerBadge owner={variant.owner} />
              <RecipeMeta cuisine={variant.cuisine} method={variant.method} />
            </Box>
          ))}
        </Stack>
      )}
    </Section>
  );
}

/**
 * The detail page's sections, top to bottom. A new section (guidance: Pairings,
 * When to Eat, Nutrition, #159) is one more entry after Tips.
 */
export const DETAIL_SECTIONS: {
  key: string;
  Component: (p: SectionProps) => ReactNode;
}[] = [
  { key: 'whats-different', Component: WhatsDifferentSection },
  { key: 'ingredients', Component: IngredientsSection },
  { key: 'steps', Component: StepsSection },
  { key: 'tips', Component: TipsSection },
  { key: 'variants', Component: VariantsSection },
];
