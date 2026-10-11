import { Button, Stack, Typography } from '@pocket-pantry/ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import {
  localName,
  type AdminListEntry,
  type ListKind,
} from '../../../lib/admin';

type Props = {
  kind: ListKind;
  entries: AdminListEntry[];
  onCreate: () => void;
  onEdit: (id: string) => void;
};

/** The Admin-curated Cuisine or Method list that Recipes pick from. */
export function ListSection({ kind, entries, onCreate, onEdit }: Props) {
  const { t, i18n } = useTranslation('admin');
  const headingId = useId();
  return (
    <Stack spacing={1} component="section" aria-labelledby={headingId}>
      <Typography id={headingId} component="h2" variant="h6">
        {t(`list.${kind}.title`)}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {t(`list.${kind}.hint`)}
      </Typography>
      <div>
        <Button onClick={onCreate}>{t(`list.${kind}.new`)}</Button>
      </div>
      {entries.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t(`list.${kind}.empty`)}
        </Typography>
      ) : (
        <Stack
          component="ul"
          aria-labelledby={headingId}
          spacing={0.5}
          sx={{ m: 0, p: 0, listStyle: 'none' }}
        >
          {entries.map((entry) => {
            const name = localName(entry, i18n.language);
            return (
              <li key={entry.id}>
                <Button
                  variant="text"
                  aria-label={t(`list.${kind}.edit`, { name })}
                  onClick={() => onEdit(entry.id)}
                >
                  {name}
                </Button>
              </li>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
