import { ScreenHeader, type ScreenHeaderAction } from '@pocket-pantry/ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  title: string;
  subtitle?: string;
  action?: ScreenHeaderAction;
  trailing?: ReactNode;
};

export function AppScreenHeader({ title, subtitle, action, trailing }: Props) {
  const { t } = useTranslation('screenHeader');
  return (
    <ScreenHeader
      title={title}
      subtitle={subtitle}
      homeLabel={t('home')}
      action={action}
      trailing={trailing}
    />
  );
}
