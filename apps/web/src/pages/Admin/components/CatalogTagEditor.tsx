import { Button, Stack, TextField } from '@pocket-pantry/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  localName,
  useDeleteCatalogTag,
  useSaveCatalogTag,
  type AdminCatalogTag,
  type AdminTagGroup,
} from '../../../lib/admin';
import { ConfirmPrompt } from '../../../components/ConfirmAction';
import { EditorForm } from '../../../components/EditorForm';
import { ApiError } from '../../../lib/api';
import { TranslationsEditor } from './TranslationsEditor';

type Props = {
  /** Omit to create a new Catalog Tag. */
  tag?: AdminCatalogTag;
  groups: AdminTagGroup[];
  onDone: () => void;
};

/**
 * Create, rename, move, translate or delete a Catalog Tag. Deleting one that Recipes carry asks first, saying (by the
 * server's count) how many will lose it. A same-named Family Tag is folded into it by the server, silently.
 */
export function CatalogTagEditor({ tag, groups, onDone }: Props) {
  const { t, i18n } = useTranslation('admin');
  const save = useSaveCatalogTag(tag?.id);
  const remove = useDeleteCatalogTag();
  const [name, setName] = useState(tag?.name ?? '');
  const [groupId, setGroupId] = useState(tag?.groupId ?? groups[0]?.id ?? '');
  // The server's count of Recipes carrying the Tag, once it has refused an unconfirmed delete.
  const [usage, setUsage] = useState<number | null>(null);

  const deleteTag = (confirm: boolean) => {
    if (!tag) return;
    remove.mutate(
      { id: tag.id, confirm },
      {
        onSuccess: onDone,
        onError: (error) => {
          if (
            error instanceof ApiError &&
            error.code === 'catalog.tag_in_use'
          ) {
            setUsage(Number(error.params.count));
          }
        },
      },
    );
  };
  const asking = usage !== null;

  return (
    <Stack spacing={3}>
      <EditorForm
        heading={
          tag
            ? t('tag.edit', { name: localName(tag, i18n.language) })
            : t('tag.new')
        }
        error={save.error ?? (asking ? null : remove.error)}
        canSave={name.trim() !== '' && groupId !== ''}
        saving={save.isPending}
        onSubmit={() =>
          save.mutate({ name: name.trim(), groupId }, { onSuccess: onDone })
        }
        onCancel={onDone}
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
        {tag && asking ? (
          <ConfirmPrompt
            message={t('tag.deleteConfirm', { count: usage })}
            disabled={remove.isPending}
            onConfirm={() => deleteTag(true)}
            onCancel={() => setUsage(null)}
          />
        ) : tag ? (
          <Button
            type="button"
            variant="ghost"
            disabled={remove.isPending}
            onClick={() => deleteTag(false)}
          >
            {t('common.delete')}
          </Button>
        ) : null}
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
