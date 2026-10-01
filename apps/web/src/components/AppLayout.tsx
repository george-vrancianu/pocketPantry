import { PageLayout } from '@pocket-pantry/ui';
import { Outlet, useLocation } from 'react-router-dom';
import { dockStateFor } from '../lib/dockState';
import { AppDock } from './AppDock';

/** The signed-in shell: page frame plus the Dock for the current route. */
export function AppLayout() {
  const { pathname } = useLocation();
  const dock = dockStateFor(pathname);
  return (
    <>
      <PageLayout withDock={dock.visible} dark={dock.variant === 'dark'}>
        <Outlet />
      </PageLayout>
      {dock.visible ? (
        <AppDock variant={dock.variant} activeKey={dock.activeKey} />
      ) : null}
    </>
  );
}
