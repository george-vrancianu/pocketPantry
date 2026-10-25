import {
  Alert,
  Box,
  radius,
  Spinner,
  Stack,
  displayType,
  tokens,
} from '@pocket-pantry/ui';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AppScreenHeader } from '../../components/AppScreenHeader';
import { ExploreRow } from '../../components/ExploreRow';
import { HiddenByAllergiesNote } from '../../components/HiddenByAllergiesNote';
import { translateApiError } from '../../i18n/translateApiError';
import { localIso } from '../../lib/pantry';
import { useAddToFamily } from '../../lib/addToFamily';
import {
  canMakeCards,
  cardFor,
  indexCards,
  useCookTonight,
} from '../../lib/cookTonight';
import {
  isFiltering,
  useRecipeFilters,
  useRecipes,
  type RecipeBrowse,
  type RecipeListItem,
} from '../../lib/recipes';
import { RecipeFilters } from './components/RecipeFilters';
import { SectionLabel } from './components/SectionLabel';

/** Rows a group shows before "Show n more". */
const LIMIT = 4;

const SLIDE = '320ms cubic-bezier(.2,.8,.2,1)';

/** Slides in from the right and, on Back, out to it; no motion under reduced motion. */
const slideSx = (leaving: boolean) =>
  ({
    '@keyframes pp-explore-slide-in': {
      from: { transform: 'translateX(100%)' },
      to: { transform: 'translateX(0)' },
    },
    '@keyframes pp-explore-slide-out': {
      from: { transform: 'translateX(0)' },
      to: { transform: 'translateX(100%)' },
    },
    '@media (prefers-reduced-motion: no-preference)': {
      animation: `${leaving ? 'pp-explore-slide-out' : 'pp-explore-slide-in'} ${SLIDE}${leaving ? ' forwards' : ''}`,
    },
  }) as const;

/**
 * Explore (`/recipes/explore`): the Catalog Base Recipes, each one tap from being added to the
 * Family. "You can make this" (Catalog Cook Tonight) comes first, then "All Recipes"; searching or
 * filtering folds them into one "Matches" list that lists Catalog Variants too.
 */
export function ExplorePage() {
  const { t } = useTranslation(['recipes', 'common']);
  const [browse, setBrowse] = useState<RecipeBrowse>({
    search: '',
    cuisineId: '',
    methodId: '',
  });
  const [showHidden, setShowHidden] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const navigate = useNavigate();
  // A native listener: React skips `animationend` where the browser (or jsdom) has no CSS animations.
  const pageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const page = pageRef.current;
    if (!leaving || !page) return;
    const done = (event: Event) => {
      if (event.target === page) navigate('/recipes');
    };
    page.addEventListener('animationend', done);
    // If the animation never ends (interrupted, or no CSS animations), leave anyway.
    const fallback = window.setTimeout(() => navigate('/recipes'), 400);
    return () => {
      page.removeEventListener('animationend', done);
      window.clearTimeout(fallback);
    };
  }, [leaving, navigate]);
  // Net adds this visit: the Back badge. It resets when the page unmounts.
  const [added, setAdded] = useState(0);
  const onNet = useCallback(
    (delta: 1 | -1) => setAdded((n) => Math.max(0, n + delta)),
    [],
  );
  const recipes = useRecipes(browse, { showHidden, scope: 'catalog' });
  const cookTonight = useCookTonight(
    // oxlint-disable-next-line react/purity -- "today" must follow the clock across midnight
    localIso(new Date()),
    showHidden,
    'catalog',
  );
  const filters = useRecipeFilters();
  const { add, stateOf } = useAddToFamily({ onNet });
  const filtering = isFiltering(browse);
  const items = recipes.data?.recipes ?? [];
  const cards = cookTonight.data?.cards ?? [];
  const index = indexCards(cards);

  // The Bases the Pantry can make, most expiring first. A card's best match can be a Catalog
  // Variant; the group lists its Base (the Variant is reached through the Base).
  const canMake = (() => {
    if (filtering) return [];
    const byId = new Map(items.map((item) => [item.id, item]));
    const seen = new Set<string>();
    const rows: RecipeListItem[] = [];
    for (const card of canMakeCards(cards)) {
      const base = byId.get(card.base.id);
      if (base && !seen.has(base.id)) {
        seen.add(base.id);
        rows.push(base);
      }
    }
    return rows;
  })();
  const canMakeIds = new Set(canMake.map((item) => item.id));
  const rest = filtering
    ? items
    : items.filter((item) => !canMakeIds.has(item.id));

  const hiddenCount = filtering
    ? (recipes.data?.hiddenByAllergiesCount ?? 0)
    : Math.max(
        recipes.data?.hiddenByAllergiesCount ?? 0,
        cookTonight.data?.hiddenByAllergiesCount ?? 0,
      );

  const group = (
    label: string,
    rows: RecipeListItem[],
    options: { hideCanMake?: boolean } = {},
  ) => (
    <Group
      key={`${label}|${browse.search}|${browse.cuisineId}|${browse.methodId}`}
      label={label}
      rows={rows}
      render={(recipe) => (
        <ExploreRow
          key={recipe.id}
          recipe={recipe}
          state={stateOf(recipe)}
          onAdd={() => void add(recipe)}
          card={cardFor(index, recipe)}
          filtering={filtering}
          hideCanMake={options.hideCanMake ?? false}
        />
      )}
    />
  );

  return (
    <Box sx={slideSx(leaving)} ref={pageRef}>
      <AppScreenHeader
        title={t('recipes:explore.title')}
        back={{
          label:
            added > 0
              ? t('recipes:explore.backAdded', { count: added })
              : t('recipes:explore.back'),
          href: '/recipes',
          badge: added,
          onClick: (event) => {
            const plain =
              event.button === 0 &&
              !event.metaKey &&
              !event.ctrlKey &&
              !event.shiftKey &&
              !event.altKey;
            const still = window.matchMedia(
              '(prefers-reduced-motion: reduce)',
            ).matches;
            if (!plain || still) return;
            event.preventDefault();
            setLeaving(true);
          },
        }}
      />
      <Stack spacing={1.5} useFlexGap>
        <Box
          sx={{ fontSize: 13.5, color: tokens.color.muted, lineHeight: 1.4 }}
        >
          {t('recipes:explore.subline')}
        </Box>
        <RecipeFilters
          value={browse}
          onChange={setBrowse}
          options={filters.data}
          searchLabel={t('recipes:explore.search')}
        />
        <HiddenByAllergiesNote
          count={hiddenCount}
          onShow={() => setShowHidden(true)}
        />
        {recipes.error ? (
          <Alert>{translateApiError(t, recipes.error)}</Alert>
        ) : null}
        {recipes.isPending ? <Spinner label={t('common:loading')} /> : null}
        {recipes.data && items.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: '32px' }}>
            <Box sx={{ ...displayType, fontSize: 18 }}>
              {t('recipes:noMatches')}
            </Box>
            <Box sx={{ fontSize: 14, color: tokens.color.muted, mt: '4px' }}>
              {t('recipes:explore.noMatchesHint')}
            </Box>
          </Box>
        ) : null}
        {canMake.length > 0
          ? group(t('recipes:explore.canMake'), canMake, { hideCanMake: true })
          : null}
        {rest.length > 0
          ? group(
              filtering ? t('recipes:matches') : t('recipes:allRecipes'),
              rest,
            )
          : null}
      </Stack>
    </Box>
  );
}

/** A labelled list showing `LIMIT` rows, then a dashed "Show n more" row. */
function Group({
  label,
  rows,
  render,
}: {
  label: string;
  rows: RecipeListItem[];
  render: (recipe: RecipeListItem) => ReactNode;
}) {
  const { t } = useTranslation('recipes');
  const headingId = useId();
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? rows : rows.slice(0, LIMIT);
  const hidden = rows.length - shown.length;
  return (
    <section>
      <SectionLabel id={headingId} count={rows.length}>
        {label}
      </SectionLabel>
      <Box
        component="ul"
        aria-labelledby={headingId}
        sx={{ listStyle: 'none', m: 0, p: 0 }}
      >
        {shown.map(render)}
      </Box>
      {hidden > 0 ? (
        <Box
          component="button"
          type="button"
          onClick={() => setExpanded(true)}
          sx={{
            display: 'block',
            width: '100%',
            mt: '8px',
            py: '12px',
            border: `1.5px dashed ${tokens.color.line}`,
            borderRadius: radius.control,
            bgcolor: 'transparent',
            color: tokens.color.accent,
            font: 'inherit',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {t('explore.showMore', { count: hidden })}
        </Box>
      ) : null}
    </section>
  );
}
