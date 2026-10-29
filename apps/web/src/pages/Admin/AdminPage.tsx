import { Alert, SegmentedControl, Spinner, Stack } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { AppScreenHeader } from '../../components/AppScreenHeader';
import { AisleEditor } from './components/AisleEditor';
import { AisleList } from './components/AisleList';
import { CategoryEditor } from './components/CategoryEditor';
import { CategoryTree } from './components/CategoryTree';
import { AllergenEditor } from './components/AllergenEditor';
import { AllergenList } from './components/AllergenList';
import { EatingMomentEditor } from './components/EatingMomentEditor';
import { EatingMomentList } from './components/EatingMomentList';
import { IngredientEditor } from './components/IngredientEditor';
import { IngredientList } from './components/IngredientList';
import { CatalogTagEditor } from './components/CatalogTagEditor';
import { CatalogTagList } from './components/CatalogTagList';
import { TagGroupEditor } from './components/TagGroupEditor';
import { TagGroupList } from './components/TagGroupList';
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
  } else if (catalog && editing?.type === 'allergen') {
    body = (
      <AllergenEditor
        key={editing.id ?? 'new'}
        allergen={screen.editedAllergen}
        onDone={screen.close}
      />
    );
  } else if (catalog && editing?.type === 'tagGroup') {
    body = (
      <TagGroupEditor
        key={editing.id ?? 'new'}
        group={screen.editedTagGroup}
        onDone={screen.close}
      />
    );
  } else if (catalog && editing?.type === 'tag') {
    body = (
      <CatalogTagEditor
        key={editing.id ?? 'new'}
        tag={screen.editedTag}
        groups={catalog.tagGroups}
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
          <Stack spacing={4}>
            <IngredientList
              ingredients={screen.ingredients}
              filter={screen.filter}
              onFilterChange={screen.setFilter}
              onCreate={() => screen.edit({ type: 'ingredient', id: null })}
              onEdit={(id) => screen.edit({ type: 'ingredient', id })}
            />
            <AllergenList
              allergens={catalog.allergens}
              onCreate={() => screen.edit({ type: 'allergen', id: null })}
              onEdit={(id) => screen.edit({ type: 'allergen', id })}
            />
          </Stack>
        ) : screen.tab === 'recipes' ? (
          <Stack spacing={4}>
            <RecipeList
              onCreate={() => screen.edit({ type: 'recipe', id: null })}
              onEdit={(id) => screen.edit({ type: 'recipe', id })}
            />
            <TagGroupList
              groups={catalog.tagGroups}
              onCreate={() => screen.edit({ type: 'tagGroup', id: null })}
              onEdit={(id) => screen.edit({ type: 'tagGroup', id })}
            />
            <CatalogTagList
              groups={catalog.tagGroups}
              tags={catalog.tags}
              onCreate={() => screen.edit({ type: 'tag', id: null })}
              onEdit={(id) => screen.edit({ type: 'tag', id })}
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
