import { useTranslation } from 'react-i18next';
import { AppScreenHeader } from '../../components/AppScreenHeader';

export function FamilyPage() {
  const { t } = useTranslation('family');
  return <AppScreenHeader title={t('title')} />;
}
