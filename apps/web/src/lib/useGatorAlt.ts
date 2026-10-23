import type { GatorMood } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';

/**
 * The translated alt text for a Gator mood (`gator:alt.<mood>`), for `<GatorImage alt=... />`.
 * Pass `decorative` to the image instead when the text beside it already says what Gator is doing.
 */
export function useGatorAlt(): (mood: GatorMood) => string {
  const { t } = useTranslation('gator');
  return (mood) => t(`alt.${mood}`);
}
