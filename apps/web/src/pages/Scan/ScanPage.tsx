import { useTranslation } from 'react-i18next';
import { AppScreenHeader } from '../../components/AppScreenHeader';

export function ScanPage() {
  const { t } = useTranslation('scan');
  return <AppScreenHeader title={t('title')} />;
}
