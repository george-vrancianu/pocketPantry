import { ScreenHeader, type ScreenHeaderProps } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';

type Props = Pick<ScreenHeaderProps, 'title' | 'action' | 'titleRef'>;

export function AppScreenHeader({ title, action, titleRef }: Props) {
  const { t } = useTranslation('screenHeader');
  return (
    <ScreenHeader
      title={title}
      homeLabel={t('home')}
      action={action}
      titleRef={titleRef}
    />
  );
}
