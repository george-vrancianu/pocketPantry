import { CheckIcon } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { AppScreenHeader } from '../../components/AppScreenHeader';

export function CustomisePage() {
  const { t } = useTranslation('customise');
  return (
    <AppScreenHeader
      title={t('title')}
      action={{ label: t('done'), icon: <CheckIcon size={20} />, href: '/' }}
    />
  );
}
