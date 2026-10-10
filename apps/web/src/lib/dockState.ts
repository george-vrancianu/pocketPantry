export type DockState = {
  visible: boolean;
  /** Which of shopping, pantry, recipes, scan is highlighted; none on other screens. */
  activeKey: string | undefined;
};

const DOCK_SECTIONS = ['shopping', 'pantry', 'recipes', 'scan'];

/** Handoff section 3: no dock on /customise or anywhere under /scan, active item by section. */
export function dockStateFor(pathname: string): DockState {
  const [, section = ''] = pathname.split('/');
  return {
    // The camera is full-screen and Review has its own sticky action bar: neither shows the dock.
    visible: section !== 'customise' && section !== 'scan',
    activeKey: DOCK_SECTIONS.includes(section) ? section : undefined,
  };
}
