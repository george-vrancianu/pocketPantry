import { Stack, TextField } from '@pocket-pantry/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  localName,
  useDeleteIngredient,
  useSaveIngredient,
  type AdminCatalog,
  type AdminIngredient,
} from '../../../lib/admin';
import { UNITS, type Unit } from '../../../lib/catalog';
import { EditorForm } from './EditorForm';
import { TranslationsEditor } from './TranslationsEditor';

type Props = {
  /** Omit to create a new Ingredient. */
  ingredient?: AdminIngredient;
  catalog: AdminCatalog;
  onDone: () => void;
};

/** Create or edit one Ingredient: name, Leaf Category, default unit, translations and Synonyms. */
export function IngredientEditor({ ingredient, catalog, onDone }: Props) {
  const { t, i18n } = useTranslation(['admin', 'errors']);
  const save = useSaveIngredient(ingredient?.id);
  const remove = useDeleteIngredient();
  const [name, setName] = useState(ingredient?.name ?? '');
  const [leafCategoryId, setLeafCategoryId] = useState(
    ingredient?.leafCategoryId ?? catalog.leafCategories[0]?.id ?? '',
  );
  const [defaultUnit, setDefaultUnit] = useState<Unit>(
    ingredient?.defaultUnit ?? 'g',
  );

  const leaves = catalog.leafCategories.map((leaf) => {
    const parent = catalog.parentCategories.find((p) => p.id === leaf.parentId);
    return {
      id: leaf.id,
      label: `${parent ? localName(parent, i18n.language) : ''} › ${localName(leaf, i18n.language)}`,
    };
  });

  return (
    <Stack spacing={3}>
      <EditorForm
        heading={
          ingredient
            ? t('admin:ingredient.edit', {
                name: localName(ingredient, i18n.language),
              })
            : t('admin:ingredient.new')
        }
        error={save.error ?? remove.error}
        canSave={name.trim() !== ''}
        saving={save.isPending}
        onSubmit={() =>
          save.mutate(
            { name: name.trim(), leafCategoryId, defaultUnit },
            { onSuccess: onDone },
          )
        }
        onCancel={onDone}
        onDelete={
          ingredient
            ? () => remove.mutate(ingredient.id, { onSuccess: onDone })
            : undefined
        }
        deleting={remove.isPending}
      >
        <TextField
          label={t('admin:ingredient.name')}
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <TextField
          select
          label={t('admin:ingredient.leafCategory')}
          value={leafCategoryId}
          onChange={(event) => setLeafCategoryId(event.target.value)}
          slotProps={{ select: { native: true } }}
        >
          {leaves.map((leaf) => (
            <option key={leaf.id} value={leaf.id}>
              {leaf.label}
            </option>
          ))}
        </TextField>
        <TextField
          select
          label={t('admin:ingredient.defaultUnit')}
          value={defaultUnit}
          onChange={(event) => setDefaultUnit(event.target.value as Unit)}
          slotProps={{ select: { native: true } }}
        >
          {UNITS.map((unit) => (
            <option key={unit} value={unit}>
              {t(`admin:units.${unit}`)}
            </option>
          ))}
        </TextField>
      </EditorForm>
      {ingredient ? (
        <TranslationsEditor
          entityType="ingredient"
          entityId={ingredient.id}
          name={ingredient.name}
          translations={ingredient.translations}
        />
      ) : null}
    </Stack>
  );
}
