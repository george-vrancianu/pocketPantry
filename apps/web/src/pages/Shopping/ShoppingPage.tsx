import { useTranslation } from 'react-i18next';
import { AppScreenHeader } from '../../components/AppScreenHeader';

export function ShoppingPage() {
  const { t } = useTranslation('shopping');
  return <AppScreenHeader title={t('title')} />;
}
