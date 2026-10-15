import { TextField } from '@pocket-pantry/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EditorForm } from '../../../components/EditorForm';
import { LOCALES, type Locale } from '../../../i18n/resources';
import {
  useAddSharedSynonym,
  type FamilySynonymCandidate,
} from '../../../lib/familySynonymsQueue';

type Props = {
  candidate: FamilySynonymCandidate;
  onDone: () => void;
  onCancel: () => void;
};

/** Add a Family Synonym candidate as a shared Synonym, in a chosen language. */
export function FamilySynonymAdd({ candidate, onDone, onCancel }: Props) {
  const { t } = useTranslation('admin');
  const add = useAddSharedSynonym();
  const [locale, setLocale] = useState<Locale>('en');

  const submit = () => {
    if (add.isPending) return;
    add.mutate(
      {
        normalizedName: candidate.normalizedName,
        ingredientId: candidate.ingredient.id,
        locale,
      },
      { onSuccess: onDone },
    );
  };

  return (
    <EditorForm
      heading={t('familySynonyms.addTitle', { name: candidate.name })}
      description={t('familySynonyms.addHint', {
        ingredient: candidate.ingredient.name,
      })}
      error={add.error}
      canSave
      saving={add.isPending}
      onSubmit={submit}
      onCancel={onCancel}
      saveLabel={t('familySynonyms.add')}
      savingLabel={t('familySynonyms.adding')}
    >
      <TextField
        select
        label={t('familySynonyms.language')}
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        slotProps={{ select: { native: true } }}
      >
        {LOCALES.map((code) => (
          <option key={code} value={code}>
            {t(`locales.${code}`)}
          </option>
        ))}
      </TextField>
    </EditorForm>
  );
}
