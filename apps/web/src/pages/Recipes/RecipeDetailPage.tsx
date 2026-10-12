import {
  Alert,
  Box,
  SegmentedTabs,
  segmentedTabId,
  segmentedTabPanelId,
  Snackbar,
  Spinner,
  Stack,
  tokens,
  usePrefersReducedMotion,
} from '@pocket-pantry/ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { translateApiError } from '../../i18n/translateApiError';
import { ApiError } from '../../lib/api';
import {
  useAddMissingToShoppingList,
  useRecipe,
  useRecipePantryMatch,
} from '../../lib/recipes';
import { RecipeHero } from './components/RecipeHero';
import { RecipeHeader } from './components/RecipeHeader';
import { linesToAdd } from './components/PantryStatus';
import { DETAIL_SECTIONS, type DetailTab } from './components/sections';

/** One Recipe. Keyed by id so Servings and add results never leak across a Variant <-> base link. */
export function RecipeDetailPage() {
  const { id = '' } = useParams();
  return <RecipeDetail key={id} id={id} />;
}

/** Header, then the sections; a Variant links back to its base. */
function RecipeDetail({ id }: { id: string }) {
  const { t, i18n } = useTranslation(['recipes', 'common']);
  const query = useRecipe(id, i18n.language);
  const recipe = query.data;
  const [picked, setPicked] = useState<number | null>(null);
  const servings = picked ?? recipe?.servings ?? 1;
  const matchQuery = useRecipePantryMatch(id, servings, recipe !== undefined);
  const match = matchQuery.data;
  const addMissing = useAddMissingToShoppingList(id, i18n.language);
  const [added, setAdded] = useState<number | null>(null);
  const onAddMissing = () => {
    const count = linesToAdd(match).length;
    addMissing.mutate(servings, { onSuccess: () => setAdded(count) });
  };

  const tabsId = useId();
  const [tab, setTab] = useState<DetailTab>('ingredients');
  const reduceMotion = usePrefersReducedMotion();
  const openTab = (next: DetailTab) => {
    if (next === tab) return;
    setTab(next);
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };
  const toBuy = match?.shortOrMissingCount ?? 0;

  return (
    <>
      <RecipeHeader recipe={recipe} />
      <Stack spacing={2.5}>
        {query.error ? (
          <Alert>
            {query.error instanceof ApiError && query.error.status === 404
              ? t('recipes:notFound')
              : translateApiError(t, query.error)}
          </Alert>
        ) : null}
        {query.isPending ? <Spinner label={t('common:loading')} /> : null}
        {recipe ? (
          <>
            <RecipeHero recipe={recipe} servings={servings} />
            <Box
              sx={{
                position: 'sticky',
                top: 0,
                zIndex: 2,
                py: '8px',
                bgcolor: tokens.color.bg,
                // Paints the page background out to the screen edges.
                boxShadow: `0 0 0 100vmax ${tokens.color.bg}`,
                clipPath: 'inset(0 -100vmax)',
              }}
            >
              <SegmentedTabs
                label={t('recipes:title')}
                id={tabsId}
                value={tab}
                onChange={openTab}
                tabs={[
                  {
                    value: 'ingredients',
                    label: t('recipes:tabs.ingredients'),
                    badge:
                      toBuy > 0
                        ? t('recipes:pantry.toBuy', { count: toBuy })
                        : undefined,
                  },
                  { value: 'steps', label: t('recipes:tabs.steps') },
                  { value: 'about', label: t('recipes:tabs.about') },
                ]}
              />
            </Box>
            <Stack
              role="tabpanel"
              id={segmentedTabPanelId(tabsId, tab)}
              aria-labelledby={segmentedTabId(tabsId, tab)}
              spacing={2.5}
            >
              {DETAIL_SECTIONS.filter((section) => section.tab === tab).map(
                ({ key, Component }) => (
                  <Component
                    key={key}
                    recipe={recipe}
                    servings={servings}
                    onServingsChange={setPicked}
                    match={match}
                    stale={matchQuery.isPlaceholderData}
                    adding={addMissing.isPending}
                    addError={
                      addMissing.error
                        ? translateApiError(t, addMissing.error)
                        : null
                    }
                    onAddMissing={onAddMissing}
                  />
                ),
              )}
            </Stack>
          </>
        ) : null}
      </Stack>
      <Snackbar
        open={added !== null}
        onClose={() => setAdded(null)}
        bottom="aboveDock"
      >
        <Alert severity="success" role="status">
          {t('recipes:pantry.added', { count: added ?? 0 })}
        </Alert>
      </Snackbar>
    </>
  );
}
