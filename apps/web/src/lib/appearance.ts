import {
  readAppearance,
  subscribeAppearance,
  writeAppearance,
  type Appearance,
  type ThemeId,
} from '@pocket-pantry/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { apiRequest } from './api';
import { preferencesQueryKey, type MemberPreferences } from './settings';

/** The device's appearance, kept current when it changes here or in another tab. */
export function useAppearance(): Appearance {
  const [appearance, setAppearance] = useState(readAppearance);
  useEffect(() => {
    // Catch a change made between the first render and subscribing.
    setAppearance(readAppearance());
    return subscribeAppearance(setAppearance);
  }, []);
  return appearance;
}

/** Match system is device-only: it is stored locally and never saved on the Member. */
export function setMatchSystem(matchSystem: boolean) {
  writeAppearance({ ...readAppearance(), matchSystem });
}

const saveThemeKey = ['settings', 'preferences', 'theme'] as const;

/**
 * Chooses a Theme: applies and stores it on the device at once, then saves it
 * on the Member (a Member Preference).
 */
export function useChooseTheme() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: saveThemeKey,
    mutationFn: (theme: ThemeId) =>
      apiRequest<MemberPreferences>('/settings/preferences', {
        method: 'PUT',
        body: { theme },
      }),
    onMutate: (theme) => {
      writeAppearance({ ...readAppearance(), theme });
      // Optimistic, so the applied server value already matches and is not re-applied.
      queryClient.setQueryData<MemberPreferences>(preferencesQueryKey, (old) =>
        old ? { ...old, theme } : old,
      );
    },
    onSuccess: (saved) => {
      // An earlier save answering after a later choice must not undo that choice.
      if (queryClient.isMutating({ mutationKey: saveThemeKey }) > 1) return;
      queryClient.setQueryData(preferencesQueryKey, saved);
    },
  });
  return (theme: ThemeId) => mutation.mutate(theme);
}
