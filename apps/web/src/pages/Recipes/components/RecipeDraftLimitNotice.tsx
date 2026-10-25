import { Alert } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import { ApiError } from '../../../lib/api';

/** Shown when a Member starts one Recipe Draft too many (the cap, `recipe_drafts.limit_reached`): finish or discard one. Other failures are not shown here. */
export function RecipeDraftLimitNotice({ error }: { error: unknown }) {
  const { t } = useTranslation('errors');
  if (
    !(error instanceof ApiError) ||
    error.code !== 'recipe_drafts.limit_reached'
  )
    return null;
  return <Alert>{translateApiError(t, error)}</Alert>;
}
