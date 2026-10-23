import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLocale } from '../i18n';
import { preferencesQueryKey, useMemberPreferences } from '../lib/settings';

/**
 * Applies the locale saved on the Member (a Member Preference) once it loads, so
 * a sign-in on any device shows the Member's language. Renders nothing.
 */
export function ApplyMemberLocale() {
  const { i18n } = useTranslation();
  const preferences = useMemberPreferences().data;
  const saved = preferences?.locale ?? null;
  const nothingStored = preferences !== undefined && saved === null;
  useEffect(() => {
    if (saved && saved !== i18n.language) void changeLocale(i18n, saved);
    // Only react to the saved value changing, not to the Member switching language later.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved]);
  // The effective Catalog Language depends on the device language only while no UI Language is stored.
  const queryClient = useQueryClient();
  const language = i18n.resolvedLanguage ?? i18n.language;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) first.current = false;
    else if (nothingStored)
      void queryClient.invalidateQueries({ queryKey: preferencesQueryKey });
    // Only react to the device language changing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);
  return null;
}
