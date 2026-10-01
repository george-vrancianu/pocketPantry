import {
  Dock,
  PantryIcon,
  RecipesIcon,
  ScanIcon,
  ShoppingIcon,
  type DockEntry,
} from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import type { DockState } from '../lib/dockState';
import { confirmLeave } from '../lib/leaveGuard';

export function AppDock({
  variant,
  activeKey,
}: Pick<DockState, 'variant' | 'activeKey'>) {
  const { t } = useTranslation('dock');
  const items: DockEntry[] = [
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
    {
      key: 'scan',
      label: t('scan'),
      href: '/scan',
      icon: <ScanIcon />,
      emphasis: true,
    },
  ];
  return (
    <Dock
      label={t('label')}
      items={items}
      activeKey={activeKey}
      variant={variant}
      onNavigate={(event) => {
        if (!confirmLeave()) event.preventDefault();
      }}
    />
  );
}
