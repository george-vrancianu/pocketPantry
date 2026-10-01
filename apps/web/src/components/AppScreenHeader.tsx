import { ScreenHeader, type ScreenHeaderAction } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';

type Props = { title: string; action?: ScreenHeaderAction };

export function AppScreenHeader({ title, action }: Props) {
  const { t } = useTranslation('screenHeader');
  return <ScreenHeader title={title} homeLabel={t('home')} action={action} />;
}
