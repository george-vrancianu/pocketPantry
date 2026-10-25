import { RefreshStatusLine } from '@pocket-pantry/ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useRefreshScreen } from '../lib/refresh';

/** The refresh status line, with its copy and the layout's refresh state. */
export function RefreshStatus({ rest }: { rest?: ReactNode }) {
  const { t } = useTranslation('screenHeader');
  const { state } = useRefreshScreen();
  return (
    <RefreshStatusLine
      state={state}
      rest={rest}
      labels={{
        busy: t('refresh.busy'),
        done: t('refresh.done'),
        failed: t('refresh.failed'),
      }}
    />
  );
}
