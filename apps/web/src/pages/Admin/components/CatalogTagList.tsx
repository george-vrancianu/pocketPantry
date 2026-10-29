import { Button, Stack, Typography } from '@pocket-pantry/ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import {
  localName,
  type AdminCatalogTag,
  type AdminTagGroup,
} from '../../../lib/admin';

type Props = {
  /** In display order. */
  groups: AdminTagGroup[];
  tags: AdminCatalogTag[];
  onCreate: () => void;
  onEdit: (id: string) => void;
};

/** The Catalog Tags, listed under their Tag Group in group order. */
export function CatalogTagList({ groups, tags, onCreate, onEdit }: Props) {
  const { t, i18n } = useTranslation('admin');
  const headingId = useId();
  return (
    <Stack spacing={1} component="section" aria-labelledby={headingId}>
      <Typography id={headingId} component="h2" variant="h6">
        {t('tag.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {t('tag.hint')}
      </Typography>
      <div>
        <Button onClick={onCreate} disabled={groups.length === 0}>
          {t('tag.new')}
        </Button>
      </div>
      {tags.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t('tag.empty')}
        </Typography>
      ) : null}
      {groups.map((group) => {
        const inGroup = tags
          .filter((tag) => tag.groupId === group.id)
          .map((tag) => ({ tag, name: localName(tag, i18n.language) }))
          .sort((a, b) => a.name.localeCompare(b.name, i18n.language));
        if (inGroup.length === 0) return null;
        const groupName = localName(group, i18n.language);
        return (
          <Stack key={group.id} spacing={0.5}>
            <Typography variant="sectionLabel" color="text.secondary">
              {groupName}
            </Typography>
            <Stack
              component="ul"
              aria-label={groupName}
              spacing={0.5}
              sx={{ m: 0, p: 0, listStyle: 'none' }}
            >
              {inGroup.map(({ tag, name }) => (
                <li key={tag.id}>
                  <Button
                    variant="ghost"
                    aria-label={t('tag.edit', { name })}
                    onClick={() => onEdit(tag.id)}
                  >
                    {name}
                  </Button>
                </li>
              ))}
            </Stack>
          </Stack>
        );
      })}
    </Stack>
  );
}
