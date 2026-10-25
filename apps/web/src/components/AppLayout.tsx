import Box from '@mui/material/Box';
import { PageLayout } from '@pocket-pantry/ui';
import type { ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { dockStateFor } from '../lib/dockState';
import { micClearance } from '../lib/voicePlacement';
import { ApplyMemberLocale } from './ApplyMemberLocale';
import { ApplyMemberTheme } from './ApplyMemberTheme';
import { AppDock } from './AppDock';
import { RefreshProvider, useRefreshScreen } from '../lib/refresh';
import { useShowsDockMic, VoiceNote } from './VoiceNote';
import { VoiceHostProvider, VoiceHostSlot } from './voice/VoiceHost';

/** The line editor, whose tablet layout is a wide table (the overview of cards is not). */
const isWide = (pathname: string) => pathname.startsWith('/scan/review/');

/** Fades the screen's content (not its header) while a refresh runs, keeping the data already shown. */
function RefreshDimmed({ children }: { children: ReactNode }) {
  const { state } = useRefreshScreen();
  return (
    <Box
      sx={{
        display: 'contents',
        '& > *:not(header)': {
          opacity: state === 'busy' ? 0.55 : 1,
          transition: 'opacity 250ms',
        },
      }}
    >
      {children}
    </Box>
  );
}

/** The signed-in shell: page frame plus the Dock for the current route. */
export function AppLayout() {
  const { pathname } = useLocation();
  const dock = dockStateFor(pathname);
  const showsMic = useShowsDockMic();
  return (
    <>
      <ApplyMemberLocale />
      <ApplyMemberTheme />
      <RefreshProvider>
        <VoiceHostProvider>
          <PageLayout
            withDock={dock.visible}
            dockClearance={showsMic ? micClearance : undefined}
            wide={isWide(pathname)}
          >
            <RefreshDimmed>
              <Outlet />
            </RefreshDimmed>
          </PageLayout>
          <VoiceHostSlot />
          <VoiceNote />
          {dock.visible ? <AppDock activeKey={dock.activeKey} /> : null}
        </VoiceHostProvider>
      </RefreshProvider>
    </>
  );
}
