import { SegmentedControl } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { changeLocale, LOCALES, type Locale } from '../i18n';
import { isLocale } from '../i18n/resources';

type Props = { onChange?: (locale: Locale) => void };

export function LanguageSwitcher({ onChange }: Props) {
  const { t, i18n } = useTranslation('languageSwitcher');
  const current: Locale = isLocale(i18n.resolvedLanguage)
    ? i18n.resolvedLanguage
    : 'en';
  return (
    <SegmentedControl
      label={t('label')}
      value={current}
      options={LOCALES.map((locale) => ({ value: locale, label: t(locale) }))}
      onChange={(locale) => {
        void changeLocale(i18n, locale);
        onChange?.(locale);
      }}
    />
  );
}
