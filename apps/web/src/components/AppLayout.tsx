import { PageLayout } from '@pocket-pantry/ui';
import { Outlet, useLocation } from 'react-router-dom';
import { dockStateFor } from '../lib/dockState';
import { ApplyMemberLocale } from './ApplyMemberLocale';
import { AppDock } from './AppDock';

/** Screens whose tablet layout is a wide table. */
const WIDE_ROUTES = ['/scan/review'];

/** The signed-in shell: page frame plus the Dock for the current route. */
export function AppLayout() {
  const { pathname } = useLocation();
  const dock = dockStateFor(pathname);
  return (
    <>
      <ApplyMemberLocale />
      <PageLayout
        withDock={dock.visible}
        dark={dock.variant === 'dark'}
        wide={WIDE_ROUTES.includes(pathname)}
      >
        <Outlet />
      </PageLayout>
      {dock.visible ? (
        <AppDock variant={dock.variant} activeKey={dock.activeKey} />
      ) : null}
    </>
  );
}
