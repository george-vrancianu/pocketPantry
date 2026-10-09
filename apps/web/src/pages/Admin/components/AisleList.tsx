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
  useReorderAisles,
  type AdminAisle,
} from '../../../lib/admin';

type Props = {
  /** In shop order. */
  aisles: AdminAisle[];
  onCreate: () => void;
  onEdit: (id: string) => void;
};

/**
 * The Aisles in shop order (the order the Shopping List is grouped in), with
 * Move up / Move down buttons so the order can be changed from the keyboard.
 */
export function AisleList({ aisles, onCreate, onEdit }: Props) {
  const { t, i18n } = useTranslation(['admin', 'errors']);
  const reorder = useReorderAisles();
  const [announcement, setAnnouncement] = useState('');
  const headingId = useId();

  const move = (index: number, offset: -1 | 1) => {
    const target = index + offset;
    if (reorder.isPending || target < 0 || target >= aisles.length) return;
    const ids = aisles.map((aisle) => aisle.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    const name = localName(aisles[index], i18n.language);
    reorder.mutate(ids, {
      onSuccess: () =>
        setAnnouncement(
          t('admin:aisle.moved', {
            name,
            position: target + 1,
            total: aisles.length,
          }),
        ),
    });
  };

  return (
    <Stack spacing={1} component="section" aria-labelledby={headingId}>
      <Typography id={headingId} component="h2" variant="h6">
        {t('admin:aisle.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {t('admin:aisle.hint')}
      </Typography>
      {reorder.error ? (
        <Alert>{translateApiError(t, reorder.error)}</Alert>
      ) : null}
      <Box role="status" sx={visuallyHidden}>
        {announcement}
      </Box>
      <div>
        <Button onClick={onCreate}>{t('admin:aisle.new')}</Button>
      </div>
      <Stack
        component="ol"
        aria-labelledby={headingId}
        spacing={0.5}
        sx={{ m: 0, p: 0, listStyle: 'none' }}
      >
        {aisles.map((aisle, index) => {
          const name = localName(aisle, i18n.language);
          const first = index === 0;
          const last = index === aisles.length - 1;
          return (
            <Stack
              key={aisle.id}
              component="li"
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center' }}
            >
              <IconButton
                tone="plain"
                size={40}
                label={t('admin:aisle.moveUp', { name })}
                ariaDisabled={first || reorder.isPending}
                onClick={() => move(index, -1)}
              >
                <ChevronUpIcon />
              </IconButton>
              <IconButton
                tone="plain"
                size={40}
                label={t('admin:aisle.moveDown', { name })}
                ariaDisabled={last || reorder.isPending}
                onClick={() => move(index, 1)}
              >
                <ChevronDownIcon />
              </IconButton>
              <Button
                variant="text"
                aria-label={t('admin:aisle.edit', { name })}
                onClick={() => onEdit(aisle.id)}
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
