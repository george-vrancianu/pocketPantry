import { Alert, SegmentedControl, Spinner, Stack } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { AppScreenHeader } from '../../components/AppScreenHeader';
import { AisleEditor } from './components/AisleEditor';
import { AisleList } from './components/AisleList';
import { CategoryEditor } from './components/CategoryEditor';
import { CategoryTree } from './components/CategoryTree';
import { EatingMomentEditor } from './components/EatingMomentEditor';
import { EatingMomentList } from './components/EatingMomentList';
import { IngredientEditor } from './components/IngredientEditor';
import { IngredientList } from './components/IngredientList';
import { ListEntryEditor } from './components/ListEntryEditor';
import { ListSection } from './components/ListSection';
import { RecipeEditor } from './components/RecipeEditor';
import { RecipeList } from './components/RecipeList';
import { UnmatchedQueue } from './components/UnmatchedQueue';
import { useAdminScreen } from './hooks/useAdminScreen';

export function AdminPage() {
  const { t } = useTranslation(['admin', 'common']);
  const screen = useAdminScreen();
  const { catalog, editing } = screen;

  let body = null;
  if (catalog && editing?.type === 'ingredient') {
    body = (
      <IngredientEditor
        key={editing.id ?? 'new'}
        ingredient={screen.editedIngredient}
        catalog={catalog}
        onDone={screen.close}
      />
    );
  } else if (catalog && editing?.type === 'aisle') {
    body = (
      <AisleEditor
        key={editing.id ?? 'new'}
        aisle={screen.editedAisle}
        onDone={screen.close}
      />
    );
  } else if (catalog && editing?.type === 'recipe') {
    body = (
      <RecipeEditor
        key={editing.id ?? 'new'}
        recipeId={editing.id}
        catalog={catalog}
        onOpen={(id) => screen.edit({ type: 'recipe', id })}
        onClose={screen.close}
      />
    );
  } else if (catalog && editing?.type === 'eatingMoment') {
    body = (
      <EatingMomentEditor
        key={editing.id ?? 'new'}
        moment={screen.editedEatingMoment}
        onDone={screen.close}
      />
    );
  } else if (catalog && editing?.type === 'list') {
    body = (
      <ListEntryEditor
        key={`${editing.kind}-${editing.id ?? 'new'}`}
        kind={editing.kind}
        entry={screen.editedListEntry}
        onDone={screen.close}
      />
    );
  } else if (catalog && editing?.type === 'category') {
    body = (
      <CategoryEditor
        key={`${editing.kind}-${editing.id ?? 'new'}`}
        kind={editing.kind}
        category={screen.editedCategory}
        catalog={catalog}
        onDone={screen.close}
      />
    );
  } else if (catalog) {
    body = (
      <>
        <SegmentedControl
          label={t('admin:sections')}
          value={screen.tab}
          onChange={screen.setTab}
          options={[
            { value: 'ingredients', label: t('admin:tabs.ingredients') },
            { value: 'categories', label: t('admin:tabs.categories') },
            { value: 'recipes', label: t('admin:tabs.recipes') },
            { value: 'unmatched', label: t('admin:tabs.unmatched') },
          ]}
        />
        {screen.tab === 'ingredients' ? (
          <IngredientList
            ingredients={screen.ingredients}
            filter={screen.filter}
            onFilterChange={screen.setFilter}
            onCreate={() => screen.edit({ type: 'ingredient', id: null })}
            onEdit={(id) => screen.edit({ type: 'ingredient', id })}
          />
        ) : screen.tab === 'recipes' ? (
          <Stack spacing={4}>
            <RecipeList
              onCreate={() => screen.edit({ type: 'recipe', id: null })}
              onEdit={(id) => screen.edit({ type: 'recipe', id })}
            />
            <ListSection
              kind="cuisine"
              entries={catalog.cuisines}
              onCreate={() =>
                screen.edit({ type: 'list', kind: 'cuisine', id: null })
              }
              onEdit={(id) =>
                screen.edit({ type: 'list', kind: 'cuisine', id })
              }
            />
            <ListSection
              kind="method"
              entries={catalog.methods}
              onCreate={() =>
                screen.edit({ type: 'list', kind: 'method', id: null })
              }
              onEdit={(id) => screen.edit({ type: 'list', kind: 'method', id })}
            />
            <EatingMomentList
              moments={catalog.eatingMoments}
              onCreate={() => screen.edit({ type: 'eatingMoment', id: null })}
              onEdit={(id) => screen.edit({ type: 'eatingMoment', id })}
            />
          </Stack>
        ) : screen.tab === 'unmatched' ? (
          <UnmatchedQueue catalog={catalog} />
        ) : (
          <Stack spacing={4}>
            <AisleList
              aisles={catalog.aisles}
              onCreate={() => screen.edit({ type: 'aisle', id: null })}
              onEdit={(id) => screen.edit({ type: 'aisle', id })}
            />
            <CategoryTree
              catalog={catalog}
              onCreate={(kind) =>
                screen.edit({ type: 'category', kind, id: null })
              }
              onEdit={(kind, id) => screen.edit({ type: 'category', kind, id })}
            />
          </Stack>
        )}
      </>
    );
  }

  return (
    <>
      <AppScreenHeader title={t('admin:title')} />
      <Stack spacing={3}>
        {screen.error ? <Alert>{screen.error}</Alert> : null}
        {screen.isLoading ? <Spinner label={t('common:loading')} /> : null}
        {body}
      </Stack>
    </>
  );
}
