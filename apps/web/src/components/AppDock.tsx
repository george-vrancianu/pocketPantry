import {
  Dock,
  DockCapsule,
  HomeIcon,
  PantryIcon,
  RecipesIcon,
  ShoppingIcon,
  type DockEntry,
} from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import type { DockState } from '../lib/dockState';
import { VOICE_LAYER } from '../lib/voicePlacement';
import { useShowsDockMic } from './VoiceNote';
import { useDockRaised, useRegisterDockMicSlot } from './voice/VoiceHost';

export function AppDock({ activeKey }: Pick<DockState, 'activeKey'>) {
  const { t } = useTranslation('dock');
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
      zIndex={raised ? VOICE_LAYER.dock : undefined}
      centre={
        <DockCapsule
          cameraLabel={t('camera')}
          cameraHref="/scan"
          micSlot={showMic ? registerMicSlot : undefined}
        />
      }
    />
  );
}
