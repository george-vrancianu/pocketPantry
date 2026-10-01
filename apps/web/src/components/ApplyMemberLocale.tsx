import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLocale } from '../i18n';
import { useMemberPreferences } from '../lib/settings';

/**
 * Applies the locale saved on the Member (a Member Preference) once it loads, so
 * a sign-in on any device shows the Member's language. Renders nothing.
 */
export function ApplyMemberLocale() {
  const { i18n } = useTranslation();
  const saved = useMemberPreferences().data?.locale ?? null;
  useEffect(() => {
    if (saved && saved !== i18n.language) void changeLocale(i18n, saved);
    // Only react to the saved value changing, not to the Member switching language later.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved]);
  return null;
}
