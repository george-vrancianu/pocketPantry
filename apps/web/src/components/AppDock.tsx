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
import { useLocation } from 'react-router-dom';
import type { DockState } from '../lib/dockState';
import { useVoiceConfigured } from '../lib/voice';
import { defaultListFor } from './VoiceNote';
import { useRegisterDockMicSlot } from './voice/VoiceHost';

export function AppDock({ activeKey }: Pick<DockState, 'activeKey'>) {
  const { t } = useTranslation('dock');
  const { pathname } = useLocation();
  const registerMicSlot = useRegisterDockMicSlot();
  // The mic half is for the pages with a Default List, and only where voice is configured.
  const configured = useVoiceConfigured();
  const showMic = configured && defaultListFor(pathname) !== null;
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
