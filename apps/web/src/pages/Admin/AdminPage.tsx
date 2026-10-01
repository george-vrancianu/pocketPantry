import { useTranslation } from 'react-i18next';
import { AppScreenHeader } from '../../components/AppScreenHeader';

export function AdminPage() {
  const { t } = useTranslation('admin');
  return <AppScreenHeader title={t('title')} />;
}
