import { Typography } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import type { AutosaveStatus } from '../lib/recipeDraftAutosave';

/** The form header's inline note on the Recipe Draft: "Saving…", then "Draft saved". Not a toast. */
export function RecipeDraftStatus({ status }: { status: AutosaveStatus }) {
  const { t } = useTranslation('recipes');
  return (
    <Typography
      component="span"
      variant="meta"
      color="text.secondary"
      role="status"
    >
      {status === 'saving'
        ? t('recipeDraft.saving')
        : status === 'saved'
          ? t('recipeDraft.saved')
          : null}
    </Typography>
  );
}
