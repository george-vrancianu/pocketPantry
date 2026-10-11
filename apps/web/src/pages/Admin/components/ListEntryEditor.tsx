import { Stack, TextField } from '@pocket-pantry/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  localName,
  useDeleteListEntry,
  useSaveListEntry,
  type AdminListEntry,
  type ListKind,
} from '../../../lib/admin';
import { EditorForm } from '../../../components/EditorForm';
import { TranslationsEditor } from './TranslationsEditor';

type Props = {
  kind: ListKind;
  /** Omit to create a new entry. */
  entry?: AdminListEntry;
  onDone: () => void;
};

/** Create, rename, translate or delete a Cuisine or Method, like an Aisle. */
export function ListEntryEditor({ kind, entry, onDone }: Props) {
  const { t, i18n } = useTranslation('admin');
  const save = useSaveListEntry(kind, entry?.id);
  const remove = useDeleteListEntry(kind);
  const [name, setName] = useState(entry?.name ?? '');

  return (
    <Stack spacing={3}>
      <EditorForm
        heading={
          entry
            ? t(`list.${kind}.edit`, { name: localName(entry, i18n.language) })
            : t(`list.${kind}.new`)
        }
        error={save.error ?? remove.error}
        canSave={name.trim() !== ''}
        saving={save.isPending}
        onSubmit={() =>
          save.mutate({ name: name.trim() }, { onSuccess: onDone })
        }
        onCancel={onDone}
        onDelete={
          entry
            ? () => remove.mutate(entry.id, { onSuccess: onDone })
            : undefined
        }
        deleting={remove.isPending}
      >
        <TextField
          label={t(`list.${kind}.name`)}
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </EditorForm>
      {entry ? (
        <TranslationsEditor
          entityType={kind}
          entityId={entry.id}
          name={entry.name}
          translations={entry.translations}
          synonyms={false}
        />
      ) : null}
    </Stack>
  );
}
