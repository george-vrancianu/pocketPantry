import { RefreshLoader } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { useRefreshScreen } from '../lib/refresh';

/** The layout's refresh loader, with its copy: it drops from the top of the app while the screen refreshes. */
export function RefreshLoaderSlot() {
  const { t } = useTranslation('screenHeader');
  const { state } = useRefreshScreen();
  return (
    <RefreshLoader
      state={state}
      labels={{
        busy: t('refresh.busy'),
        done: t('refresh.done'),
        failed: t('refresh.failed'),
      }}
    />
  );
}
