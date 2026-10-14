import {
  DEFAULT_APPEARANCE,
  readAppearance,
  writeAppearance,
} from '@pocket-pantry/ui';
import { useEffect } from 'react';
import { useMemberPreferences } from '../lib/settings';

/**
 * Applies the Theme saved on the Member (a Member Preference) once it loads,
 * so a sign-in on any device shows the Member's Theme. A server value that
 * differs from the device's wins; `null` (never chosen) means the default.
 * Match system stays as the device has it. Renders nothing.
 */
export function ApplyMemberTheme() {
  const preferences = useMemberPreferences().data;
  const saved = preferences
    ? (preferences.theme ?? DEFAULT_APPEARANCE.theme)
    : undefined;
  useEffect(() => {
    if (saved === undefined) return;
    const device = readAppearance();
    if (device.theme !== saved) writeAppearance({ ...device, theme: saved });
  }, [saved]);
  return null;
}
