import type { AdminCatalog } from '../../../lib/admin';
import type { useAdminScreen } from '../hooks/useAdminScreen';
import { AisleEditor } from './AisleEditor';
import { AllergenEditor } from './AllergenEditor';
import { CatalogTagEditor } from './CatalogTagEditor';
import { CategoryEditor } from './CategoryEditor';
import { EatingMomentEditor } from './EatingMomentEditor';
import { IngredientEditor } from './IngredientEditor';
import { RecipeEditor } from './RecipeEditor';
import { TagGroupEditor } from './TagGroupEditor';
import { EditorSheet } from './EditorSheet';

/**
 * The editor for whatever `useAdminScreen().editing` names. Recipes replace the section's list
 * (the full-page editor); every other editor opens as a sheet over the list.
 */
export function AdminEditor({
  screen,
  catalog,
}: {
  screen: ReturnType<typeof useAdminScreen>;
  catalog: AdminCatalog;
}) {
  const { editing } = screen;
  if (!editing) return null;
  if (editing.type === 'recipe') {
    return <PageEditor screen={screen} catalog={catalog} />;
  }
  return (
    <EditorSheet onClose={screen.close}>
      <PageEditor screen={screen} catalog={catalog} />
    </EditorSheet>
  );
}

function PageEditor({
  screen,
  catalog,
}: {
  screen: ReturnType<typeof useAdminScreen>;
  catalog: AdminCatalog;
}) {
  const { editing } = screen;
  if (!editing) return null;
  if (editing.type === 'ingredient') {
    return (
      <IngredientEditor
        key={editing.id ?? 'new'}
        ingredient={screen.editedIngredient}
        catalog={catalog}
        onDone={screen.close}
      />
    );
  }
  if (editing.type === 'aisle') {
    return (
      <AisleEditor
        key={editing.id ?? 'new'}
        aisle={screen.editedAisle}
        onDone={screen.close}
      />
    );
  }
  if (editing.type === 'recipe') {
    return (
      <RecipeEditor
        key={editing.id ?? 'new'}
        recipeId={editing.id}
        catalog={catalog}
        onOpen={(id) => screen.edit({ type: 'recipe', id })}
        onClose={screen.close}
      />
    );
  }
  if (editing.type === 'eatingMoment') {
    return (
      <EatingMomentEditor
        key={editing.id ?? 'new'}
        moment={screen.editedEatingMoment}
        onDone={screen.close}
      />
    );
  }
  if (editing.type === 'allergen') {
    return (
      <AllergenEditor
        key={editing.id ?? 'new'}
        allergen={screen.editedAllergen}
        onDone={screen.close}
      />
    );
  }
  if (editing.type === 'tagGroup') {
    return (
      <TagGroupEditor
        key={editing.id ?? 'new'}
        group={screen.editedTagGroup}
        onDone={screen.close}
      />
    );
  }
  if (editing.type === 'tag') {
    return (
      <CatalogTagEditor
        key={editing.id ?? 'new'}
        tag={screen.editedTag}
        groups={catalog.tagGroups}
        onDone={screen.close}
      />
    );
  }
  if (editing.type === 'category') {
    return (
      <CategoryEditor
        key={`${editing.kind}-${editing.id ?? 'new'}`}
        kind={editing.kind}
        category={screen.editedCategory}
        catalog={catalog}
        onDone={screen.close}
      />
    );
  }
  return null;
}
