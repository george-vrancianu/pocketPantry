import { Alert, Button, Stack, TextField } from '@pocket-pantry/ui';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import {
  LOCATIONS,
  localName,
  useDeleteCategory,
  useSaveCategory,
  type AdminCatalog,
  type AdminLeafCategory,
  type AdminParentCategory,
  type CategoryKind,
  type Location,
} from '../../../lib/admin';
import { TranslationsEditor } from './TranslationsEditor';

type Props = {
  kind: CategoryKind;
  /** Omit to create a new Category. */
  category?: AdminParentCategory | AdminLeafCategory;
  catalog: AdminCatalog;
  onDone: () => void;
};

/** Create or edit a Parent Category (carries the Aisle) or a Leaf Category. */
export function CategoryEditor({ kind, category, catalog, onDone }: Props) {
  const { t, i18n } = useTranslation(['admin', 'errors']);
  const save = useSaveCategory(kind, category?.id);
  const remove = useDeleteCategory(kind);
  const [name, setName] = useState(category?.name ?? '');
  const initialOwner =
    category === undefined
      ? undefined
      : 'aisleId' in category
        ? category.aisleId
        : category.parentId;
  const owners = kind === 'parent' ? catalog.aisles : catalog.parentCategories;
  const [ownerId, setOwnerId] = useState(initialOwner ?? owners[0]?.id ?? '');
  const [expiry, setExpiry] = useState(
    category?.defaultExpiryDays?.toString() ?? '',
  );
  const [location, setLocation] = useState<Location | ''>(
    category?.defaultLocation ?? '',
  );
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const error = save.error ?? remove.error;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    save.mutate(
      {
        name: name.trim(),
        ...(kind === 'parent' ? { aisleId: ownerId } : { parentId: ownerId }),
        defaultExpiryDays: expiry.trim() === '' ? null : Number(expiry),
        defaultLocation: location === '' ? null : location,
      },
      { onSuccess: onDone },
    );
  };

  return (
    <Stack spacing={3}>
      <Stack component="form" spacing={2} onSubmit={submit} noValidate>
        {error ? <Alert>{translateApiError(t, error)}</Alert> : null}
        <TextField
          label={t('admin:category.name')}
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <TextField
          select
          label={
            kind === 'parent'
              ? t('admin:category.aisle')
              : t('admin:category.parent')
          }
          value={ownerId}
          onChange={(event) => setOwnerId(event.target.value)}
          slotProps={{ select: { native: true } }}
        >
          {owners.map((owner) => (
            <option key={owner.id} value={owner.id}>
              {localName(owner, i18n.language)}
            </option>
          ))}
        </TextField>
        <TextField
          label={t('admin:category.defaultExpiryDays')}
          type="number"
          value={expiry}
          onChange={(event) => setExpiry(event.target.value)}
          slotProps={{ htmlInput: { min: 0, max: 3650 } }}
        />
        <TextField
          select
          label={t('admin:category.defaultLocation')}
          value={location}
          onChange={(event) => setLocation(event.target.value as Location | '')}
          slotProps={{ select: { native: true } }}
        >
          <option value="">{t('admin:locations.none')}</option>
          {LOCATIONS.map((value) => (
            <option key={value} value={value}>
              {t(`admin:locations.${value}`)}
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
          {category ? (
            confirmingDelete ? (
              <Button
                variant="secondary"
                disabled={remove.isPending}
                onClick={() =>
                  remove.mutate(category.id, { onSuccess: onDone })
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
      {category ? (
        <TranslationsEditor
          entityType={kind === 'parent' ? 'parent_category' : 'leaf_category'}
          entityId={category.id}
          name={category.name}
          translations={category.translations}
        />
      ) : null}
    </Stack>
  );
}
