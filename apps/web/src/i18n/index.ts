import i18next, { type i18n as I18n } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { detectLocale, saveLocale } from './locale-storage';
import {
  FALLBACK_LOCALE,
  LOCALES,
  namespaces,
  resources,
  type Locale,
} from './resources';

/** A fresh i18next instance. Tests create their own; the app creates one in `main.tsx`. */
export function createI18n(locale: Locale = detectLocale()): I18n {
  const instance = i18next.createInstance();
  void instance.use(initReactI18next).init({
    resources,
    lng: locale,
    fallbackLng: FALLBACK_LOCALE,
    supportedLngs: [...LOCALES],
    ns: namespaces,
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    initAsync: false,
  });
  document.documentElement.lang = locale;
  instance.on('languageChanged', (next) => {
    document.documentElement.lang = next;
  });
  return instance;
}

/** Switch language and remember the choice. */
export async function changeLocale(instance: I18n, locale: Locale) {
  saveLocale(locale);
  await instance.changeLanguage(locale);
}

export { LOCALES, type Locale } from './resources';
