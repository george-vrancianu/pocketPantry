import {
  Alert,
  Button,
  SegmentedControl,
  Stack,
  TextField,
  Typography,
} from '@pocket-pantry/ui';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import { CatalogSearch } from '../../../components/CatalogSearch';
import {
  CATALOG_LOCALES,
  localName,
  type AdminCatalog,
  type CatalogLocale,
} from '../../../lib/admin';
import { UNITS, type Unit } from '../../../lib/catalog';
import {
  useResolveUnmatched,
  type UnmatchedEntry,
} from '../../../lib/unmatched';

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
  const { t, i18n } = useTranslation(['admin', 'errors']);
  const resolve = useResolveUnmatched();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [mode, setMode] = useState<Mode>('existing');
  const [picked, setPicked] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [name, setName] = useState(entry.rawName);
  const [leafCategoryId, setLeafCategoryId] = useState(
    catalog.leafCategories.find((leaf) => !leaf.isOther)?.id ??
      catalog.leafCategories[0]?.id ??
      '',
  );
  const [defaultUnit, setDefaultUnit] = useState<Unit>('g');
  const [locale, setLocale] = useState<CatalogLocale>(entry.locale);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const leaves = catalog.leafCategories.map((leaf) => {
    const parent = catalog.parentCategories.find((p) => p.id === leaf.parentId);
    return {
      id: leaf.id,
      label: `${parent ? localName(parent, i18n.language) : ''} › ${localName(leaf, i18n.language)}`,
    };
  });

  const canSubmit =
    mode === 'existing'
      ? picked !== null
      : name.trim() !== '' && leafCategoryId !== '';

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit || resolve.isPending) return;
    const target =
      mode === 'existing'
        ? { ingredientId: picked?.id as string }
        : {
            newIngredient: {
              name: name.trim(),
              leafCategoryId,
              defaultUnit,
            },
          };
    const ingredientName = mode === 'existing' ? picked?.name : name.trim();
    resolve.mutate(
      { normalizedName: entry.normalizedName, locale, ...target },
      {
        onSuccess: (result) =>
          onDone(
            t('admin:unmatched.resolved', {
              count: result.relinkedBatches + result.relinkedShoppingItems,
              name: ingredientName,
            }),
          ),
      },
    );
  };

  return (
    <Stack component="form" spacing={2} onSubmit={submit} noValidate>
      <Typography
        ref={headingRef}
        component="h2"
        variant="h6"
        tabIndex={-1}
        sx={{ outline: 'none' }}
      >
        {t('admin:unmatched.resolveName', { name: entry.rawName })}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {t('admin:unmatched.rows', { count: entry.count })}
      </Typography>
      {resolve.error ? (
        <Alert>{translateApiError(t, resolve.error)}</Alert>
      ) : null}
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
        </Stack>
      )}
      <TextField
        select
        label={t('admin:unmatched.synonymLocale')}
        helperText={t('admin:unmatched.synonymHint', { name: entry.rawName })}
        value={locale}
        onChange={(event) => setLocale(event.target.value as CatalogLocale)}
        slotProps={{ select: { native: true } }}
      >
        {CATALOG_LOCALES.map((code) => (
          <option key={code} value={code}>
            {t(`admin:locales.${code}`)}
          </option>
        ))}
      </TextField>
      <Stack direction="row" spacing={1}>
        <Button type="submit" disabled={!canSubmit || resolve.isPending}>
          {resolve.isPending
            ? t('admin:unmatched.resolving')
            : t('admin:unmatched.confirm')}
        </Button>
        <Button variant="text" onClick={onCancel}>
          {t('admin:common.cancel')}
        </Button>
      </Stack>
    </Stack>
  );
}
