import { useTranslation } from 'react-i18next';
import { AppScreenHeader } from '../../components/AppScreenHeader';

export function RecipesPage() {
  const { t } = useTranslation('recipes');
  return <AppScreenHeader title={t('title')} />;
}
