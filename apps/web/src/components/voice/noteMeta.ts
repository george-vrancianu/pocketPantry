import type { TFunction } from 'i18next';
import type { ScanLanguage } from '../../i18n/resources';
import { formatClock } from '../../lib/voice';
import type { VoiceDefaultTarget } from '../../lib/voice';

/**
 * The small line under a Voice Note: its list and Spoken Language "Shopping list · English", and with a
 * duration the "What I heard" wording of the language and length. Needs the `voice` and `settings` namespaces.
 */
export function noteMeta(
  t: TFunction,
  defaultTarget: VoiceDefaultTarget,
  language: ScanLanguage,
  durationMs?: number,
): string {
  const languageName = t(`settings:languageNames.${language}`);
  return [
    defaultTarget === 'none'
      ? t('voice:inbox.noList')
      : t(`voice:review.lists.${defaultTarget}`),
    durationMs === undefined
      ? languageName
      : t('voice:review.heardMeta', {
          language: languageName,
          duration: formatClock(durationMs),
        }),
  ].join(' · ');
}
