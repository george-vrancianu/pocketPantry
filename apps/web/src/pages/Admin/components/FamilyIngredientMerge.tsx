import { Stack, Typography } from '@pocket-pantry/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CatalogSearch } from '../../../components/catalogSearch/CatalogSearch';
import { BrowseByAisle } from '../../../components/catalogSearch/emptyState/BrowseByAisle';
import { EditorForm } from '../../../components/EditorForm';
import {
  useMergeFamilyIngredient,
  type FamilyIngredientGroup,
} from '../../../lib/familyIngredientsQueue';

type Props = {
  group: FamilyIngredientGroup;
  /** Called with the name of the shared Ingredient the group went into. */
  onDone: (target: string) => void;
  onCancel: () => void;
};

/**
 * Merge a Family Ingredient group into an existing shared Ingredient, found
 * with the shared Catalog search. Every Family keeps the name as its own synonym.
 */
export function FamilyIngredientMerge({ group, onDone, onCancel }: Props) {
  const { t } = useTranslation('admin');
  const merge = useMergeFamilyIngredient();
  const [picked, setPicked] = useState<{ id: string; name: string } | null>(
    null,
  );

  const submit = () => {
    const ingredientId = group.copies[0]?.id;
    if (!picked || !ingredientId || merge.isPending) return;
    merge.mutate(
      { ingredientId, targetIngredientId: picked.id },
      { onSuccess: () => onDone(picked.name) },
    );
  };

  return (
    <EditorForm
      heading={t('familyIngredients.mergeName', { name: group.name })}
      description={t('familyIngredients.mergeHint')}
      error={merge.error}
      canSave={picked !== null}
      saving={merge.isPending}
      onSubmit={submit}
      onCancel={onCancel}
      saveLabel={t('familyIngredients.merge')}
      savingLabel={t('familyIngredients.merging')}
    >
      <Stack spacing={1}>
        <CatalogSearch
          emptyState={<BrowseByAisle />}
          showUnit={false}
          scope="shared"
          onSelect={(ingredient) =>
            setPicked({ id: ingredient.id, name: ingredient.name })
          }
          onQueryChange={() => setPicked(null)}
        />
        {picked ? (
          <Typography variant="body2">
            {t('unmatched.picked', { name: picked.name })}
          </Typography>
        ) : null}
      </Stack>
    </EditorForm>
  );
}
