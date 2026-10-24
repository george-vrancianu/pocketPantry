import { useTranslation } from 'react-i18next';
import { languageName } from '../lib/languageName';
import { useMemberPreferences } from '../lib/settings';
import type { ReadingLanguage } from '../lib/linkRecipe';
import { ChoiceRadioGroup } from './ChoiceRadioGroup';

/**
 * Which language a Recipe read from the web comes out in: the Member's Catalog Language (the
 * default, translated if the page is in another) or the page's own. Controlled, so the link step
 * and the paste-text mode of Recipe from Link can share one value.
 */
export function ReadingLanguageChoice({
  value,
  onChange,
}: {
  value: ReadingLanguage;
  onChange: (value: ReadingLanguage) => void;
}) {
  const { t, i18n } = useTranslation('recipes');
  const preferences = useMemberPreferences();
  // Until the Preferences arrive, the UI Language stands in: it is the Catalog Language unless the Member chose another.
  const uiLanguage = i18n.resolvedLanguage ?? 'en';
  const catalogName = languageName(
    preferences.data?.effectiveCatalogLanguage ?? uiLanguage,
    uiLanguage,
  );
  return (
    <ChoiceRadioGroup<ReadingLanguage>
      label={t('readingLanguage.label')}
      layout="chips"
      value={value}
      onChange={onChange}
      choices={[
        {
          value: 'catalog',
          label: t('readingLanguage.catalog', {
            language: catalogName,
          }),
        },
        { value: 'source', label: t('readingLanguage.source') },
      ]}
    />
  );
}
