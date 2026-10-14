import {
  isThemeId,
  readAppearance,
  subscribeAppearance,
  writeAppearance,
  type Appearance,
  type ThemeId,
} from '@pocket-pantry/ui';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
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

/**
 * The Theme chosen on this device and not yet saved on the Member. Kept under
 * its own key, outside `pp.appearance`, which MUI's storage adapter reads.
 */
const PENDING_THEME_KEY = 'pp.appearance.unsynced';

export function readPendingTheme(): ThemeId | null {
  try {
    const value = window.localStorage.getItem(PENDING_THEME_KEY);
    return isThemeId(value) ? value : null;
  } catch {
    return null;
  }
}

function writePendingTheme(theme: ThemeId | null) {
  try {
    if (theme) window.localStorage.setItem(PENDING_THEME_KEY, theme);
    else window.localStorage.removeItem(PENDING_THEME_KEY);
  } catch {
    // Blocked storage: the choice still saves while this page is open.
  }
}

/** Per query client, so each app (and each test) has its own save in flight. */
const savesInFlight = new WeakSet<QueryClient>();

/**
 * Saves the device's unsynced Theme on the Member, one request at a time:
 * choices made while a save is in flight only update the unsynced Theme,
 * and the latest is sent once that save settles. A failed save stays
 * unsynced until the next try (preferences loading, the device coming back
 * online, or another choice).
 */
export function syncPendingTheme(queryClient: QueryClient) {
  const theme = readPendingTheme();
  if (!theme || savesInFlight.has(queryClient)) return;
  savesInFlight.add(queryClient);
  apiRequest<MemberPreferences>('/settings/preferences', {
    method: 'PUT',
    body: { theme },
  }).then(
    (saved) => {
      savesInFlight.delete(queryClient);
      if (readPendingTheme() === theme) {
        writePendingTheme(null);
        queryClient.setQueryData(preferencesQueryKey, saved);
      } else {
        syncPendingTheme(queryClient);
      }
    },
    () => {
      savesInFlight.delete(queryClient);
      // The read may have been cancelled for the choice; load it again.
      if (!queryClient.getQueryData(preferencesQueryKey)) {
        void queryClient.invalidateQueries({ queryKey: preferencesQueryKey });
      }
    },
  );
}

/**
 * Chooses a Theme: applies and stores it on the device at once, then saves it
 * on the Member (a Member Preference). Until that save succeeds the device's
 * choice wins over the Member's saved Theme.
 */
export function useChooseTheme() {
  const queryClient = useQueryClient();
  return (theme: ThemeId) => {
    writeAppearance({ ...readAppearance(), theme });
    writePendingTheme(theme);
    // A read already on its way holds the old Theme; the save's answer replaces it.
    void queryClient.cancelQueries({ queryKey: preferencesQueryKey });
    queryClient.setQueryData<MemberPreferences>(preferencesQueryKey, (old) =>
      old ? { ...old, theme } : old,
    );
    syncPendingTheme(queryClient);
  };
}
