import {
  Alert,
  Button,
  Spinner,
  Stack,
  TextField,
  Typography,
} from '@pocket-pantry/ui';
import { useId, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmAction } from '../../../components/ConfirmAction';
import { translateApiError } from '../../../i18n/translateApiError';
import {
  useDeleteFamilyIngredient,
  useDeleteFamilySynonym,
  useFamilyCatalog,
  useUpdateFamilyIngredient,
  type FamilyCatalogIngredient,
  type FamilyIngredientUsage,
} from '../../../lib/familyCatalog';
import { useCategoryOptions } from '../../../lib/settings';

const USAGE_KINDS: Array<keyof FamilyIngredientUsage> = [
  'batches',
  'shoppingItems',
  'templateLines',
  'recipeLines',
  'staples',
];

/** The Family catalog: what the Family added, which any Member can rename, move or delete (ticket 274). */
export function FamilyCatalogSection() {
  const { t, i18n } = useTranslation(['settings', 'common']);
  const id = useId();
  const catalog = useFamilyCatalog(i18n.language);
  const updateIngredient = useUpdateFamilyIngredient(i18n.language);
  const deleteIngredient = useDeleteFamilyIngredient();
  const deleteSynonym = useDeleteFamilySynonym();
  const [editingId, setEditingId] = useState<string | null>(null);

  const error = [
    catalog.error,
    deleteIngredient.error,
    deleteSynonym.error,
  ].find(Boolean);
  const data = catalog.data;
  const empty = data && data.ingredients.length + data.synonyms.length === 0;

  /** "3 Batches and 1 Staple", from the non-zero counts. */
  const usageText = (usage: FamilyIngredientUsage) =>
    new Intl.ListFormat(i18n.language, {
      style: 'long',
      type: 'conjunction',
    }).format(
      USAGE_KINDS.filter((kind) => usage[kind] > 0).map((kind) =>
        t(`settings:familyCatalog.usage.${kind}`, { count: usage[kind] }),
      ),
    );
  const deleteMessage = (ingredient: FamilyCatalogIngredient) => {
    const total = USAGE_KINDS.reduce(
      (sum, kind) => sum + ingredient.usage[kind],
      0,
    );
    return total === 0
      ? t('settings:familyCatalog.deleteConfirmUnused', {
          name: ingredient.name,
        })
      : t('settings:familyCatalog.deleteConfirm', {
          name: ingredient.name,
          usage: usageText(ingredient.usage),
          count: total,
        });
  };

  return (
    <Stack component="section" spacing={1} aria-labelledby={`${id}-heading`}>
      <Typography
        id={`${id}-heading`}
        variant="sectionLabel"
        component="h2"
        color="text.secondary"
      >
        {t('settings:familyCatalog.title')}
      </Typography>
      <Typography variant="meta" color="text.secondary">
        {t('settings:familyCatalog.help')}
      </Typography>
      {error ? <Alert>{translateApiError(t, error)}</Alert> : null}
      {catalog.isLoading ? <Spinner label={t('common:loading')} /> : null}
      {empty ? (
        <Typography color="text.secondary">
          {t('settings:familyCatalog.empty')}
        </Typography>
      ) : null}

      {data && data.ingredients.length > 0 ? (
        <Stack
          component="ul"
          spacing={1.5}
          sx={{ listStyle: 'none', p: 0, m: 0 }}
        >
          {data.ingredients.map((ingredient) => (
            <Stack component="li" key={ingredient.id} spacing={1}>
              {editingId === ingredient.id ? (
                <IngredientEditor
                  ingredient={ingredient}
                  saving={updateIngredient.isPending}
                  error={updateIngredient.error}
                  onCancel={() => {
                    updateIngredient.reset();
                    setEditingId(null);
                  }}
                  onSave={(changes) =>
                    updateIngredient.mutate(
                      { id: ingredient.id, ...changes },
                      { onSuccess: () => setEditingId(null) },
                    )
                  }
                />
              ) : (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Stack>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {ingredient.name}
                    </Typography>
                    <Typography variant="meta" color="text.secondary">
                      {t('settings:familyCatalog.meta', {
                        category: ingredient.leafCategory.name,
                        aisle: ingredient.parentCategory.aisle.name,
                        unit: ingredient.defaultUnit,
                      })}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="ghost"
                      aria-label={t('settings:familyCatalog.edit', {
                        name: ingredient.name,
                      })}
                      onClick={() => {
                        updateIngredient.reset();
                        setEditingId(ingredient.id);
                      }}
                    >
                      {t('settings:familyCatalog.editLabel')}
                    </Button>
                    <ConfirmAction
                      variant="ghost"
                      label={t('settings:familyCatalog.deleteLabel')}
                      triggerName={t('settings:familyCatalog.delete', {
                        name: ingredient.name,
                      })}
                      message={deleteMessage(ingredient)}
                      disabled={deleteIngredient.isPending}
                      onConfirm={() => deleteIngredient.mutate(ingredient.id)}
                    />
                  </Stack>
                </Stack>
              )}
            </Stack>
          ))}
        </Stack>
      ) : null}

      {data && data.synonyms.length > 0 ? (
        <>
          <Typography variant="body1" component="h3" sx={{ fontWeight: 700 }}>
            {t('settings:familyCatalog.synonyms')}
          </Typography>
          <Stack
            component="ul"
            spacing={1}
            sx={{ listStyle: 'none', p: 0, m: 0 }}
          >
            {data.synonyms.map((synonym) => (
              <Stack
                component="li"
                key={synonym.id}
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span>
                  {t('settings:familyCatalog.synonymRow', {
                    name: synonym.name,
                    ingredient: synonym.ingredient.name,
                  })}
                </span>
                <Button
                  variant="ghost"
                  disabled={deleteSynonym.isPending}
                  aria-label={t('settings:familyCatalog.delete', {
                    name: synonym.name,
                  })}
                  onClick={() => deleteSynonym.mutate(synonym.id)}
                >
                  {t('settings:familyCatalog.deleteLabel')}
                </Button>
              </Stack>
            ))}
          </Stack>
        </>
      ) : null}
    </Stack>
  );
}

function IngredientEditor({
  ingredient,
  saving,
  error,
  onCancel,
  onSave,
}: {
  ingredient: FamilyCatalogIngredient;
  saving: boolean;
  error: unknown;
  onCancel: () => void;
  onSave: (changes: { name?: string; leafCategoryId?: string }) => void;
}) {
  const { t, i18n } = useTranslation(['settings', 'common']);
  const id = useId();
  const categories = useCategoryOptions(i18n.language);
  const [name, setName] = useState(ingredient.name);
  const [leafId, setLeafId] = useState(ingredient.leafCategory.id);
  const trimmed = name.trim();
  const nameChanged = trimmed !== ingredient.name;
  const leafChanged = leafId !== ingredient.leafCategory.id;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!trimmed || (!nameChanged && !leafChanged)) return;
    onSave({
      ...(nameChanged ? { name: trimmed } : {}),
      ...(leafChanged ? { leafCategoryId: leafId } : {}),
    });
  };

  return (
    <Stack component="form" spacing={1} onSubmit={submit}>
      {error ? <Alert>{translateApiError(t, error)}</Alert> : null}
      <TextField
        id={`${id}-name`}
        label={t('settings:familyCatalog.name')}
        value={name}
        onChange={(event) => setName(event.target.value)}
        slotProps={{ htmlInput: { maxLength: 100 } }}
      />
      <TextField
        id={`${id}-category`}
        select
        label={t('settings:familyCatalog.category')}
        value={leafId}
        onChange={(event) => setLeafId(event.target.value)}
        slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
      >
        {/* The current Leaf shows even before the options load. */}
        {categories.data ? null : (
          <option value={ingredient.leafCategory.id}>
            {ingredient.leafCategory.name}
          </option>
        )}
        {categories.data?.parents.map((parent) => (
          <optgroup key={parent.id} label={parent.name}>
            {parent.leaves.map((leaf) => (
              <option key={leaf.id} value={leaf.id}>
                {leaf.name}
              </option>
            ))}
          </optgroup>
        ))}
      </TextField>
      <Stack direction="row" spacing={1}>
        <Button
          type="submit"
          disabled={saving || !trimmed || (!nameChanged && !leafChanged)}
        >
          {t('settings:familyCatalog.save')}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          {t('common:cancel')}
        </Button>
      </Stack>
    </Stack>
  );
}
