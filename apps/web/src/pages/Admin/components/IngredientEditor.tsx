import { Alert, Button, Stack, TextField } from '@pocket-pantry/ui';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import {
  UNITS,
  localName,
  useDeleteIngredient,
  useSaveIngredient,
  type AdminCatalog,
  type AdminIngredient,
  type Unit,
} from '../../../lib/admin';
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
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const error = save.error ?? remove.error;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    save.mutate(
      { name: name.trim(), leafCategoryId, defaultUnit },
      { onSuccess: onDone },
    );
  };

  const leaves = catalog.leafCategories.map((leaf) => {
    const parent = catalog.parentCategories.find((p) => p.id === leaf.parentId);
    return {
      id: leaf.id,
      label: `${parent ? localName(parent, i18n.language) : ''} › ${localName(leaf, i18n.language)}`,
    };
  });

  return (
    <Stack spacing={3}>
      <Stack component="form" spacing={2} onSubmit={submit} noValidate>
        {error ? <Alert>{translateApiError(t, error)}</Alert> : null}
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
        <Stack direction="row" spacing={1}>
          <Button type="submit" disabled={save.isPending || name.trim() === ''}>
            {save.isPending ? t('admin:common.saving') : t('admin:common.save')}
          </Button>
          <Button variant="text" onClick={onDone}>
            {t('admin:common.cancel')}
          </Button>
          {ingredient ? (
            confirmingDelete ? (
              <Button
                variant="secondary"
                disabled={remove.isPending}
                onClick={() =>
                  remove.mutate(ingredient.id, { onSuccess: onDone })
                }
              >
                {t('admin:common.confirmDelete')}
              </Button>
            ) : (
              <Button variant="text" onClick={() => setConfirmingDelete(true)}>
                {t('admin:common.delete')}
              </Button>
            )
          ) : null}
        </Stack>
      </Stack>
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
