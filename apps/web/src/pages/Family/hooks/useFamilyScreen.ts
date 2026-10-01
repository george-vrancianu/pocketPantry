import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import { useFamily, useRegenerateInviteCode } from '../../../lib/family';

export function useFamilyScreen() {
  const { t, i18n } = useTranslation();
  const family = useFamily();
  const regenerate = useRegenerateInviteCode();

  const error = family.error ?? regenerate.error;
  const expiresAt = family.data
    ? new Date(family.data.inviteCodeExpiresAt)
    : null;

  return {
    family: family.data,
    isLoading: family.isPending,
    error: error ? translateApiError(t, error) : null,
    expired: expiresAt !== null && expiresAt.getTime() <= Date.now(),
    expiryLabel: expiresAt
      ? new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' }).format(
          expiresAt,
        )
      : null,
    regenerate: () => regenerate.mutate(),
    regenerating: regenerate.isPending,
    retry: () => void family.refetch(),
  };
}
