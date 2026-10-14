import { useColorScheme } from '@mui/material/styles';
import { useEffect } from 'react';
import { isThemeId } from './appearance';
import { THEMES, type ThemeId } from './themes';

function paintThemeColor(theme: ThemeId) {
  for (const meta of document.querySelectorAll<HTMLMetaElement>(
    'meta[name="theme-color"]',
  )) {
    meta.content = THEMES[theme].bg;
  }
}

/**
 * For a full-screen surface locked to one Theme (the camera): the browser's
 * `theme-color` follows that Theme's bg while it is mounted, and the root
 * Theme's again after.
 */
export function useForcedThemeColor(theme: ThemeId) {
  const { colorScheme } = useColorScheme();
  useEffect(() => {
    paintThemeColor(theme);
    return () => {
      if (isThemeId(colorScheme)) paintThemeColor(colorScheme);
    };
  }, [theme, colorScheme]);
}
