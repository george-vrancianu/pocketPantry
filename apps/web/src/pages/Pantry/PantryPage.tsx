import { useTranslation } from 'react-i18next';
import { AppScreenHeader } from '../../components/AppScreenHeader';

export function PantryPage() {
  const { t } = useTranslation('pantry');
  return <AppScreenHeader title={t('title')} />;
}
