import {
  Alert,
  Box,
  Button,
  ChevronDownIcon,
  ChevronUpIcon,
  IconButton,
  Stack,
  Typography,
  visuallyHidden,
} from '@pocket-pantry/ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import {
  localName,
  useReorderTagGroups,
  type AdminTagGroup,
} from '../../../lib/admin';

type Props = {
  /** In display order. */
  groups: AdminTagGroup[];
  onCreate: () => void;
  onEdit: (id: string) => void;
};

/**
 * The Tag Groups in display order, with Move up / Move down buttons so the order can be changed from the keyboard.
 */
export function TagGroupList({ groups, onCreate, onEdit }: Props) {
  const { t, i18n } = useTranslation(['admin', 'errors']);
  const reorder = useReorderTagGroups();
  const [announcement, setAnnouncement] = useState('');
  const headingId = useId();

  const move = (index: number, offset: -1 | 1) => {
    const target = index + offset;
    if (reorder.isPending || target < 0 || target >= groups.length) return;
    const ids = groups.map((group) => group.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    const name = localName(groups[index], i18n.language);
    reorder.mutate(ids, {
      onSuccess: () =>
        setAnnouncement(
          t('admin:tagGroup.moved', {
            name,
            position: target + 1,
            total: groups.length,
          }),
        ),
    });
  };

  return (
    <Stack spacing={1} component="section" aria-labelledby={headingId}>
      <Typography id={headingId} component="h2" variant="h6">
        {t('admin:tagGroup.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {t('admin:tagGroup.hint')}
      </Typography>
      {reorder.error ? (
        <Alert>{translateApiError(t, reorder.error)}</Alert>
      ) : null}
      <Box role="status" sx={visuallyHidden}>
        {announcement}
      </Box>
      <div>
        <Button onClick={onCreate}>{t('admin:tagGroup.new')}</Button>
      </div>
      {groups.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t('admin:tagGroup.empty')}
        </Typography>
      ) : null}
      <Stack
        component="ol"
        aria-labelledby={headingId}
        spacing={0.5}
        sx={{ m: 0, p: 0, listStyle: 'none' }}
      >
        {groups.map((group, index) => {
          const name = localName(group, i18n.language);
          const first = index === 0;
          const last = index === groups.length - 1;
          return (
            <Stack
              key={group.id}
              component="li"
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center' }}
            >
              <IconButton
                tone="plain"
                size={40}
                label={t('admin:tagGroup.moveUp', { name })}
                ariaDisabled={first || reorder.isPending}
                onClick={() => move(index, -1)}
              >
                <ChevronUpIcon />
              </IconButton>
              <IconButton
                tone="plain"
                size={40}
                label={t('admin:tagGroup.moveDown', { name })}
                ariaDisabled={last || reorder.isPending}
                onClick={() => move(index, 1)}
              >
                <ChevronDownIcon />
              </IconButton>
              <Button
                variant="ghost"
                aria-label={t('admin:tagGroup.edit', { name })}
                onClick={() => onEdit(group.id)}
              >
                {name}
              </Button>
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
}
