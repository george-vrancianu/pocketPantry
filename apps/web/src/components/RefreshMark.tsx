import { GatorLogo } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { haptic } from '../lib/haptic';
import { useRefreshScreen } from '../lib/refresh';

export function RefreshMark({ size }: { size?: 38 | 42 }) {
  const { t } = useTranslation('screenHeader');
  const { run, successCount } = useRefreshScreen();
  return (
    <GatorLogo
      size={size}
      label={t('refresh.button')}
      successCount={successCount}
      onClick={() => {
        haptic(10);
        void run();
      }}
    />
  );
}
