export type DockState = {
  visible: boolean;
  variant: 'light' | 'dark';
  /** Which of shopping, pantry, recipes, scan is highlighted; none on other screens. */
  activeKey: string | undefined;
};

const DOCK_SECTIONS = ['shopping', 'pantry', 'recipes', 'scan'];

/** Handoff section 3: no dock on /customise or anywhere under /scan, active item by section. */
export function dockStateFor(pathname: string): DockState {
  const [, section = '', child] = pathname.split('/');
  return {
    // The camera is full-screen and Review has its own sticky action bar: neither shows the dock.
    visible: section !== 'customise' && section !== 'scan',
    // The camera is dark; the Review screen that follows it is an ordinary light screen.
    variant: section === 'scan' && child !== 'review' ? 'dark' : 'light',
    activeKey: DOCK_SECTIONS.includes(section) ? section : undefined,
  };
}
