import {
  Checkbox,
  SegmentedControl,
  Stack,
  TextField,
  Typography,
} from '@pocket-pantry/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LOCALES, type Locale } from '../../../i18n/resources';
import { CatalogSearch } from '../../../components/CatalogSearch';
import type { AdminCatalog, IngredientInput } from '../../../lib/admin';
import {
  useResolveUnmatched,
  type UnmatchedEntry,
} from '../../../lib/unmatched';
import { EditorForm } from './EditorForm';
import { IngredientFields } from './IngredientFields';

type Props = {
  entry: UnmatchedEntry;
  catalog: AdminCatalog;
  /** Called with the confirmation message once the name is resolved. */
  onDone: (message: string) => void;
  onCancel: () => void;
};

type Mode = 'existing' | 'new';

/**
 * Resolve one Unmatched name: link it to an existing Ingredient (found with
 * the Catalog search) or create a new one, and choose the language of the
 * Synonym it adds. The server relinks every row carrying the name in one go.
 */
export function UnmatchedResolver({ entry, catalog, onDone, onCancel }: Props) {
  const { t } = useTranslation('admin');
  const resolve = useResolveUnmatched();
  const [mode, setMode] = useState<Mode>('existing');
  const [picked, setPicked] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [newIngredient, setNewIngredient] = useState<IngredientInput>({
    name: entry.rawName,
    leafCategoryId:
      catalog.leafCategories.find((leaf) => !leaf.isOther)?.id ??
      catalog.leafCategories[0]?.id ??
      '',
    defaultUnit: 'g',
  });
  const [locale, setLocale] = useState<Locale>(entry.locale);
  // Off unless chosen: a generic printed word would match every such line, skipping the confidence threshold.
  const [sourceSynonym, setSourceSynonym] = useState(false);
  const printedLanguage = entry.sourceLanguage
    ? t(`admin:locales.${entry.sourceLanguage}`)
    : '';

  const canSubmit =
    mode === 'existing'
      ? picked !== null
      : newIngredient.name.trim() !== '' && newIngredient.leafCategoryId !== '';

  const submit = () => {
    if (!canSubmit || resolve.isPending) return;
    const target =
      mode === 'existing'
        ? { ingredientId: picked?.id as string }
        : {
            newIngredient: {
              ...newIngredient,
              name: newIngredient.name.trim(),
            },
          };
    const ingredientName =
      mode === 'existing' ? picked?.name : newIngredient.name.trim();
    resolve.mutate(
      {
        normalizedName: entry.normalizedName,
        locale,
        ...(sourceSynonym ? { sourceSynonym } : {}),
        ...target,
      },
      {
        onSuccess: (result) => {
          const linked = t('admin:unmatched.resolved', {
            count: result.relinkedBatches + result.relinkedShoppingItems,
            name: ingredientName,
          });
          const printed = result.sourceSynonymAdded
            ? t('admin:unmatched.sourceSynonymAdded', {
                text: entry.sourceText,
                language: printedLanguage,
              })
            : result.sourceSynonymSkipped
              ? t(
                  `admin:unmatched.sourceSynonymSkipped.${result.sourceSynonymSkipped}`,
                )
              : '';
          onDone(printed ? `${linked} ${printed}` : linked);
        },
      },
    );
  };

  return (
    <EditorForm
      heading={t('admin:unmatched.resolveName', { name: entry.rawName })}
      description={t('admin:unmatched.rows', { count: entry.count })}
      error={resolve.error}
      canSave={canSubmit}
      saving={resolve.isPending}
      onSubmit={submit}
      onCancel={onCancel}
      saveLabel={t('admin:unmatched.confirm')}
      savingLabel={t('admin:unmatched.resolving')}
    >
      <SegmentedControl
        label={t('admin:unmatched.modeLabel')}
        value={mode}
        onChange={setMode}
        options={[
          { value: 'existing', label: t('admin:unmatched.mode.existing') },
          { value: 'new', label: t('admin:unmatched.mode.new') },
        ]}
      />
      {mode === 'existing' ? (
        <Stack spacing={1}>
          <CatalogSearch
            onSelect={(ingredient) =>
              setPicked({ id: ingredient.id, name: ingredient.name })
            }
            onQueryChange={() => setPicked(null)}
          />
          {picked ? (
            <Typography variant="body2">
              {t('admin:unmatched.picked', { name: picked.name })}
            </Typography>
          ) : null}
        </Stack>
      ) : (
        <Stack spacing={2}>
          <IngredientFields
            catalog={catalog}
            value={newIngredient}
            onChange={setNewIngredient}
          />
        </Stack>
      )}
      <TextField
        select
        label={t('admin:unmatched.synonymLocale')}
        helperText={t('admin:unmatched.synonymHint', { name: entry.rawName })}
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        slotProps={{ select: { native: true } }}
      >
        {LOCALES.map((code) => (
          <option key={code} value={code}>
            {t(`admin:locales.${code}`)}
          </option>
        ))}
      </TextField>
      {entry.sourceText ? (
        <Checkbox
          checked={sourceSynonym}
          onChange={(event) => setSourceSynonym(event.target.checked)}
          label={t('admin:unmatched.sourceSynonym', {
            language: printedLanguage,
          })}
          helperText={t('admin:unmatched.sourceSynonymHint', {
            text: entry.sourceText,
          })}
        />
      ) : null}
    </EditorForm>
  );
}
