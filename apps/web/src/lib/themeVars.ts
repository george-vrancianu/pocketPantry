/**
 * The active Theme's tokens that the legacy `tokens` shim doesn't carry
 * (docs/handoffs/themes/handoff.md section 3), as CSS variable references.
 * They resolve per `data-theme`, so a forced subtree follows its own Theme.
 * Colours shared with the shim stay on `tokens.color`.
 */
const pp = (name: string) => `var(--pp-${name})`;
const palette = (path: string) => `var(--mui-palette-${path})`;

export const radius = {
  /** Cards, lists, sheets' inner panels. */
  card: pp('r-card'),
  /** Buttons, fields, segmented controls, small tiles. */
  control: pp('r-ctl'),
  /** Filter and suggestion chips. */
  chip: pp('r-chip'),
  /** The round Add button. */
  fab: pp('r-fab'),
  /** Checkboxes and tick boxes. */
  box: pp('r-box'),
  /** Tags and pill buttons: round in every Theme. */
  pill: '999px',
} as const;

/** A radius for an element nested `gap` px inside one with `outer`, so the curves stay concentric. */
export const nestedRadius = (outer: string, gap: number) =>
  `max(2px, calc(${outer} - ${gap}px))`;

export const shadow = {
  card: pp('shadow-card'),
  /** Primary buttons and other accent-filled lifts. */
  button: pp('shadow-btn'),
  /** Sheets, popovers, toasts. */
  float: pp('shadow-float'),
  segment: pp('shadow-seg'),
} as const;

export const border = {
  width: pp('bw'),
  field: pp('bw-field'),
} as const;

export const colour = {
  primary: palette('primary-main'),
  primaryInk: palette('primary-contrastText'),
  /** Text and icons on an `accent` fill. */
  accentInk: palette('pp-accentInk'),
  /** Text and icons on an `accentTint` fill. */
  accentOnTint: palette('pp-accentOnTint'),
  lineStrong: palette('pp-lineStrong'),
  box: palette('pp-box'),
  cardBg: palette('pp-cardBg'),
  cardLine: palette('pp-cardLine'),
  fieldBg: palette('pp-fieldBg'),
} as const;

/** The Theme's display face with its own weight and tracking. */
export const displayType = {
  fontFamily: pp('display'),
  fontWeight: pp('display-w'),
  letterSpacing: pp('display-ls'),
} as const;
