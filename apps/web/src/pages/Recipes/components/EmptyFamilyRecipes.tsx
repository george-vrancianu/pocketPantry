import {
  Box,
  Button,
  CompassIcon,
  displayType,
  Gator,
  radius,
  shadow,
  Stack,
  tokens,
} from '@pocket-pantry/ui';
import { useId, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ExploreRow } from '../../../components/ExploreRow';
import type { useAddToFamily } from '../../../lib/addToFamily';
import { canMakeBases, useCookTonight } from '../../../lib/cookTonight';
import { localIso } from '../../../lib/pantry';
import { useRecipes, type RecipeBrowse } from '../../../lib/recipes';
import { SectionLabel } from './SectionLabel';

const STARTERS = 3;
const NO_BROWSE: RecipeBrowse = { search: '', cuisineId: '', methodId: '' };

/** Gator's panel: the chef on the accent tint, with a speech bubble that fades in after the entrance. */
function GatorPanel() {
  const { t } = useTranslation('gator');
  const [taps, setTaps] = useState(0);
  return (
    <Box
      sx={{
        position: 'relative',
        height: 206,
        borderRadius: radius.card,
        bgcolor: tokens.color.accentTint,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ position: 'absolute', left: -24, bottom: -8 }}>
        <Box
          component="button"
          type="button"
          aria-label={t('chef.alt')}
          onClick={() => setTaps((n) => n + 1)}
          sx={{
            display: 'block',
            p: 0,
            border: 0,
            background: 'none',
            cursor: 'pointer',
          }}
        >
          <Gator
            mood="chef"
            size={206}
            loop="signature"
            tapSignal={taps}
            decorative
          />
        </Box>
      </Box>
      <Box
        sx={{
          position: 'absolute',
          right: 12,
          top: 16,
          width: 150,
          boxSizing: 'border-box',
          p: '11px 13px',
          borderRadius: radius.card,
          bgcolor: tokens.color.surface,
          boxShadow: shadow.card,
          color: tokens.color.ink,
          fontSize: 13.5,
          fontWeight: 600,
          lineHeight: 1.35,
          '@keyframes pp-gator-bubble-in': {
            from: { opacity: 0, transform: 'translateY(6px) scale(.94)' },
            to: { opacity: 1, transform: 'none' },
          },
          '@media (prefers-reduced-motion: no-preference)': {
            animation: 'pp-gator-bubble-in 400ms ease-out 700ms backwards',
          },
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            left: -8,
            top: 58,
            width: 16,
            height: 16,
            bgcolor: tokens.color.surface,
            transform: 'rotate(45deg)',
          }}
        />
        <Box sx={{ position: 'relative' }}>
          <Trans
            t={t}
            i18nKey="chef.emptyFamily"
            components={{
              b: (
                <Box
                  component="b"
                  sx={{ fontWeight: 700, color: tokens.color.accentOnTint }}
                />
              ),
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}

/** Up to three Catalog Bases the Family can make now, each one tap from being added. Hidden when there are none. */
type AddApi = ReturnType<typeof useAddToFamily>;

function Starters({ add, stateOf }: AddApi) {
  const { t } = useTranslation('recipes');
  const recipes = useRecipes(NO_BROWSE, { scope: 'catalog' });
  const cookTonight = useCookTonight(
    // oxlint-disable-next-line react/purity -- "today" must follow the clock across midnight
    localIso(new Date()),
    false,
    'catalog',
  );
  const headingId = useId();
  const cards = cookTonight.data?.cards ?? [];
  const starters = canMakeBases(cards, recipes.data?.recipes ?? [])
    // Defensive: bases only.
    .filter((recipe) => recipe.parentId === null)
    .slice(0, STARTERS);
  if (starters.length === 0) return null;
  return (
    <section>
      <SectionLabel id={headingId}>{t('emptyFamily.starters')}</SectionLabel>
      <Box
        component="ul"
        aria-labelledby={headingId}
        sx={{ listStyle: 'none', m: 0, p: 0 }}
      >
        {starters.map((recipe) => (
          <ExploreRow
            key={recipe.id}
            recipe={recipe}
            state={stateOf(recipe)}
            onAdd={() => add(recipe)}
            card={cards.find((card) => card.base.id === recipe.id)}
            hideCanMake
          />
        ))}
      </Box>
    </section>
  );
}

/** `/recipes` for a Family with no live Recipes: chef Gator, the two ways forward and a few starters (ADR 0029). */
export function EmptyFamilyRecipes({
  onNewRecipe,
  add,
  stateOf,
}: AddApi & {
  /** Opens the header's "+" menu. */
  onNewRecipe: () => void;
}) {
  const { t } = useTranslation('recipes');
  return (
    <Stack spacing={0} useFlexGap sx={{ pt: '4px' }}>
      <GatorPanel />
      <Box
        component="h2"
        sx={{
          ...displayType,
          fontSize: 22,
          textAlign: 'center',
          m: 0,
          mt: '16px',
        }}
      >
        {t('emptyFamily.title')}
      </Box>
      <Box
        sx={{
          fontSize: 14,
          color: tokens.color.muted,
          textAlign: 'center',
          maxWidth: '31ch',
          mx: 'auto',
          mt: '16px',
        }}
      >
        {t('emptyFamily.body')}
      </Box>
      <Stack spacing={1} useFlexGap sx={{ mt: '20px', mb: '24px' }}>
        <Button
          variant="primary"
          fullWidth
          href="/recipes/explore"
          startIcon={<CompassIcon size={20} />}
          sx={{ minHeight: 48, borderRadius: radius.pill }}
        >
          {t('emptyFamily.explore')}
        </Button>
        <Button variant="secondary" fullWidth onClick={onNewRecipe}>
          {t('emptyFamily.newRecipe')}
        </Button>
      </Stack>
      <Starters add={add} stateOf={stateOf} />
    </Stack>
  );
}
