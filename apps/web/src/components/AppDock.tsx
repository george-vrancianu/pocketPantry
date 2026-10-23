import {
  Dock,
  DockCapsule,
  HomeIcon,
  PantryIcon,
  RecipesIcon,
  ShoppingIcon,
  type DockEntry,
  type DockTeach,
} from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import type { DockState } from '../lib/dockState';
import { VOICE_LAYER } from '../lib/voicePlacement';
import { useShowsDockMic } from './VoiceNote';
import { useDockRaised, useRegisterDockMicSlot } from './voice/VoiceHost';

type Props = Partial<Pick<DockState, 'activeKey'>> & {
  /**
   * Teaching mode (the Intro): light the camera or the mic half and make everything else dim, inert and
   * out of the tab order. The lit half stays the real control with its normal name.
   */
  teach?: DockTeach;
  /** Where the camera opens; Snap passes the Scan mode the Member picked. */
  cameraHref?: string;
};

export function AppDock({ activeKey, teach, cameraHref = '/scan' }: Props) {
  const { t } = useTranslation(['dock', 'voice']);
  const registerMicSlot = useRegisterDockMicSlot();
  const showMic = useShowsDockMic();
  const raised = useDockRaised();
  const items: DockEntry[] = [
    { key: 'home', label: t('home'), href: '/', icon: <HomeIcon /> },
    {
      key: 'shopping',
      label: t('shopping'),
      href: '/shopping',
      icon: <ShoppingIcon />,
    },
    {
      key: 'pantry',
      label: t('pantry'),
      href: '/pantry',
      icon: <PantryIcon />,
    },
    {
      key: 'recipes',
      label: t('recipes'),
      href: '/recipes',
      icon: <RecipesIcon />,
    },
  ];
  return (
    <Dock
      label={t('label')}
      items={items}
      activeKey={activeKey}
      teaching={teach !== undefined}
      zIndex={raised ? VOICE_LAYER.dock : undefined}
      centre={
        <DockCapsule
          cameraLabel={t('camera')}
          cameraHref={cameraHref}
          micSlot={showMic ? registerMicSlot : undefined}
          micLabel={t('voice:voiceButton.label')}
          teach={teach}
        />
      }
    />
  );
}
