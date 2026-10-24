import { ScreenHeader, type ScreenHeaderProps } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

type Props = Pick<
  ScreenHeaderProps,
  'title' | 'subtitle' | 'action' | 'trailing' | 'titleRef' | 'back'
>;

const SETTINGS_PATH = '/settings';

export function AppScreenHeader({
  title,
  subtitle,
  action,
  trailing,
  titleRef,
  back,
}: Props) {
  const { t } = useTranslation('screenHeader');
  const { pathname } = useLocation();
  return (
    <ScreenHeader
      title={title}
      subtitle={subtitle}
      homeLabel={t('home')}
      action={action}
      trailing={trailing}
      titleRef={titleRef}
      back={back}
      settings={
        pathname === SETTINGS_PATH
          ? undefined
          : { label: t('settings'), href: SETTINGS_PATH }
      }
    />
  );
}
