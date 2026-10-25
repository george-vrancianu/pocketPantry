import {
  GatorLogo,
  ScreenHeader,
  type ScreenHeaderProps,
} from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { dockStateFor } from '../lib/dockState';
import { haptic } from '../lib/haptic';
import { useOptionalRefreshScreen, useRefreshScreen } from '../lib/refresh';
import { RefreshStatus } from './RefreshStatus';

/** Dock tabs whose root screen carries the refresh mark (the Dashboard's header is its own). */
const REFRESH_ROOTS = ['/pantry', '/shopping', '/recipes'];

export function RefreshMark({ size }: { size?: 38 | 42 }) {
  const { t } = useTranslation('screenHeader');
  const { run } = useRefreshScreen();
  return (
    <GatorLogo
      size={size}
      label={t('refresh.button')}
      onClick={() => {
        haptic(10);
        void run();
      }}
    />
  );
}

type Props = Pick<
  ScreenHeaderProps,
  'title' | 'subtitle' | 'action' | 'trailing' | 'titleRef' | 'back'
>;

/** The screen header; Home shows only where the Dock is hidden, since the Dock carries Home everywhere else. */
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
  const inLayout = useOptionalRefreshScreen() !== undefined;
  const tabRoot =
    inLayout && REFRESH_ROOTS.includes(pathname.replace(/\/$/, ''));
  return (
    <ScreenHeader
      title={title}
      leading={tabRoot ? <RefreshMark /> : undefined}
      subline={tabRoot ? <RefreshStatus /> : undefined}
      // With the mark, the Explore pill and the action in one row, a long title would break mid-word at 360 px.
      truncateTitle={tabRoot}
      subtitle={subtitle}
      home={dockStateFor(pathname).visible ? undefined : { label: t('home') }}
      action={action}
      trailing={trailing}
      titleRef={titleRef}
      back={back}
    />
  );
}
