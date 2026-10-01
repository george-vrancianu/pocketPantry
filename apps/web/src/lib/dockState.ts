export type DockState = {
  visible: boolean;
  variant: 'light' | 'dark';
  /** Which of shopping, pantry, recipes, scan is highlighted; none on other screens. */
  activeKey: string | undefined;
};

const DOCK_SECTIONS = ['shopping', 'pantry', 'recipes', 'scan'];

/** Handoff section 3: no dock on /customise, a dark dock on /scan, active item by section. */
export function dockStateFor(pathname: string): DockState {
  const section = pathname.split('/')[1] ?? '';
  return {
    visible: section !== 'customise',
    variant: section === 'scan' ? 'dark' : 'light',
    activeKey: DOCK_SECTIONS.includes(section) ? section : undefined,
  };
}
