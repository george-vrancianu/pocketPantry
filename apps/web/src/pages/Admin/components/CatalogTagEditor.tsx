import { Stack, TextField } from '@pocket-pantry/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  localName,
  useDeleteCatalogTag,
  useSaveCatalogTag,
  type AdminCatalogTag,
  type AdminTagGroup,
} from '../../../lib/admin';
import { EditorForm } from '../../../components/EditorForm';
import { TranslationsEditor } from './TranslationsEditor';

type Props = {
  /** Omit to create a new Catalog Tag. */
  tag?: AdminCatalogTag;
  groups: AdminTagGroup[];
  onDone: () => void;
};

/**
 * Create, rename, move, translate or delete a Catalog Tag. Deleting one that Recipes carry says how
 * many will lose it. A same-named Family Tag is folded into it by the server, silently.
 */
export function CatalogTagEditor({ tag, groups, onDone }: Props) {
  const { t, i18n } = useTranslation('admin');
  const save = useSaveCatalogTag(tag?.id);
  const remove = useDeleteCatalogTag();
  const [name, setName] = useState(tag?.name ?? '');
  const [groupId, setGroupId] = useState(tag?.groupId ?? groups[0]?.id ?? '');

  return (
    <Stack spacing={3}>
      <EditorForm
        heading={
          tag
            ? t('tag.edit', { name: localName(tag, i18n.language) })
            : t('tag.new')
        }
        error={save.error ?? remove.error}
        canSave={name.trim() !== '' && groupId !== ''}
        saving={save.isPending}
        onSubmit={() =>
          save.mutate({ name: name.trim(), groupId }, { onSuccess: onDone })
        }
        onCancel={onDone}
        onDelete={
          tag ? () => remove.mutate(tag.id, { onSuccess: onDone }) : undefined
        }
        deleting={remove.isPending}
        deleteMessage={
          tag
            ? tag.recipeCount > 0
              ? t('tag.deleteConfirm', { count: tag.recipeCount })
              : t('tag.deleteConfirmUnused')
            : undefined
        }
      >
        <TextField
          label={t('tag.name')}
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <TextField
          select
          label={t('tag.group')}
          value={groupId}
          onChange={(event) => setGroupId(event.target.value)}
          slotProps={{ select: { native: true } }}
        >
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {localName(group, i18n.language)}
            </option>
          ))}
        </TextField>
      </EditorForm>
      {tag ? (
        <TranslationsEditor
          entityType="tag"
          entityId={tag.id}
          name={tag.name}
          translations={tag.translations}
          synonyms={false}
        />
      ) : null}
    </Stack>
  );
}
