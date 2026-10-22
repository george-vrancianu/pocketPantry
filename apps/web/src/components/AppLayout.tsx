import { PageLayout } from '@pocket-pantry/ui';
import { Outlet, useLocation } from 'react-router-dom';
import { dockStateFor } from '../lib/dockState';
import { micClearance } from '../lib/voicePlacement';
import { ApplyMemberLocale } from './ApplyMemberLocale';
import { ApplyMemberTheme } from './ApplyMemberTheme';
import { AppDock } from './AppDock';
import { useShowsDockMic, VoiceNote } from './VoiceNote';
import { VoiceHostProvider, VoiceHostSlot } from './voice/VoiceHost';

/** The line editor, whose tablet layout is a wide table (the overview of cards is not). */
const isWide = (pathname: string) => pathname.startsWith('/scan/review/');

/** The signed-in shell: page frame plus the Dock for the current route. */
export function AppLayout() {
  const { pathname } = useLocation();
  const dock = dockStateFor(pathname);
  const showsMic = useShowsDockMic();
  return (
    <>
      <ApplyMemberLocale />
      <ApplyMemberTheme />
      <VoiceHostProvider>
        <PageLayout
          withDock={dock.visible}
          dockClearance={showsMic ? micClearance : undefined}
          wide={isWide(pathname)}
        >
          <Outlet />
        </PageLayout>
        <VoiceHostSlot />
        <VoiceNote />
        {dock.visible ? <AppDock activeKey={dock.activeKey} /> : null}
      </VoiceHostProvider>
    </>
  );
}
