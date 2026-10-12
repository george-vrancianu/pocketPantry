import { ScreenHeader, type ScreenHeaderProps } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';

type Props = Pick<
  ScreenHeaderProps,
  'title' | 'subtitle' | 'action' | 'trailing' | 'titleRef' | 'back'
>;

export function AppScreenHeader({
  title,
  subtitle,
  action,
  trailing,
  titleRef,
  back,
}: Props) {
  const { t } = useTranslation('screenHeader');
  return (
    <ScreenHeader
      title={title}
      subtitle={subtitle}
      homeLabel={t('home')}
      action={action}
      trailing={trailing}
      titleRef={titleRef}
      back={back}
    />
  );
}
