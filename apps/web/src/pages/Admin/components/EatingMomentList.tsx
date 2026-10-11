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
  useReorderEatingMoments,
  type AdminEatingMoment,
} from '../../../lib/admin';

type Props = {
  /** In display order, archived ones included. */
  moments: AdminEatingMoment[];
  onCreate: () => void;
  onEdit: (id: string) => void;
};

/**
 * The Eating Moments in display order, archived ones included and marked, with
 * Move up / Move down buttons so the order can be changed from the keyboard.
 */
export function EatingMomentList({ moments, onCreate, onEdit }: Props) {
  const { t, i18n } = useTranslation(['admin', 'errors']);
  const reorder = useReorderEatingMoments();
  const [announcement, setAnnouncement] = useState('');
  const headingId = useId();

  const move = (index: number, offset: -1 | 1) => {
    const target = index + offset;
    if (reorder.isPending || target < 0 || target >= moments.length) return;
    const ids = moments.map((moment) => moment.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    const name = localName(moments[index], i18n.language);
    reorder.mutate(ids, {
      onSuccess: () =>
        setAnnouncement(
          t('admin:eatingMoment.moved', {
            name,
            position: target + 1,
            total: moments.length,
          }),
        ),
    });
  };

  return (
    <Stack spacing={1} component="section" aria-labelledby={headingId}>
      <Typography id={headingId} component="h2" variant="h6">
        {t('admin:eatingMoment.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {t('admin:eatingMoment.hint')}
      </Typography>
      {reorder.error ? (
        <Alert>{translateApiError(t, reorder.error)}</Alert>
      ) : null}
      <Box role="status" sx={visuallyHidden}>
        {announcement}
      </Box>
      <div>
        <Button onClick={onCreate}>{t('admin:eatingMoment.new')}</Button>
      </div>
      <Stack
        component="ol"
        aria-labelledby={headingId}
        spacing={0.5}
        sx={{ m: 0, p: 0, listStyle: 'none' }}
      >
        {moments.map((moment, index) => {
          const name = localName(moment, i18n.language);
          const first = index === 0;
          const last = index === moments.length - 1;
          return (
            <Stack
              key={moment.id}
              component="li"
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center' }}
            >
              <IconButton
                tone="plain"
                size={40}
                label={t('admin:eatingMoment.moveUp', { name })}
                ariaDisabled={first || reorder.isPending}
                onClick={() => move(index, -1)}
              >
                <ChevronUpIcon />
              </IconButton>
              <IconButton
                tone="plain"
                size={40}
                label={t('admin:eatingMoment.moveDown', { name })}
                ariaDisabled={last || reorder.isPending}
                onClick={() => move(index, 1)}
              >
                <ChevronDownIcon />
              </IconButton>
              <Button
                variant="text"
                aria-label={t('admin:eatingMoment.edit', { name })}
                onClick={() => onEdit(moment.id)}
              >
                {name}
              </Button>
              {moment.archived ? (
                <Typography variant="body2" color="text.secondary">
                  {t('admin:eatingMoment.archivedBadge')}
                </Typography>
              ) : null}
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
}
