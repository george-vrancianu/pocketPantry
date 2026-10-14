/** A Theme colour from the active MUI colour scheme, e.g. `palette('pp-accent')`. */
const palette = (path: string) => `var(--mui-palette-${path})`;

/** A mix of two Theme colours, for legacy shades the Themes don't define. */
const mix = (a: string, percent: number, b: string) =>
  `color-mix(in srgb, ${a} ${percent}%, ${b})`;

const bg = palette('background-default');
const surface = palette('background-paper');
const ink = palette('text-primary');
const muted = palette('text-secondary');
const accent = palette('pp-accent');
const urgentBg = palette('error-light');
const urgentFg = palette('error-main');
const soonBg = palette('warning-light');
const soonFg = palette('warning-main');

/**
 * Legacy design tokens from pocket-pantry-handoff/HANDOFF.md section 4, kept
 * in their old shape so every importer follows the active Theme unchanged.
 * Colours are references to the Theme's variables (docs/handoffs/themes);
 * legacy keys with no Theme token are mapped to the nearest one or mixed from
 * two. Prefer `theme.vars.palette` in new code; this module goes once the
 * sweep has moved everything over.
 */
export const tokens = {
  color: {
    bg,
    surface,
    ink,
    muted,
    line: palette('pp-line'),
    divider: palette('divider'),
    subtle: palette('pp-subtle'),
    chipNeutral: palette('pp-chip'),
    /** Greyed text of a checked-off row. */
    checkedText: muted,
    /** Border of an unchecked tick box. */
    tickBorder: palette('pp-box'),
    accent,
    accentHover: mix(accent, 82, ink),
    accentTint: palette('pp-accentTint'),
    accentMid: mix(accent, 55, surface),
    accentSoftOnDark: palette('pp-accentOnTint'),
    butter: palette('secondary-main'),
    butterInk: palette('secondary-contrastText'),
    urgentBg,
    urgentHover: mix(urgentBg, 85, urgentFg),
    urgentFg,
    urgentRow: mix(urgentBg, 45, surface),
    urgentBorder: mix(urgentBg, 75, urgentFg),
    soonBg,
    soonFg,
    soonRow: mix(soonBg, 45, surface),
    soonIcon: soonFg,
    soonBorder: mix(soonBg, 60, soonFg),
    okBg: palette('success-light'),
    okFg: palette('success-main'),
  },
  font: {
    display: 'var(--pp-display)',
    body: 'var(--pp-body)',
  },
  radius: {
    dock: 26,
    widget: 22,
    card: 20,
    input: 16,
    field: 12,
    table: 24,
    counter: 18,
    chip: 999,
  },
  shadow: {
    dock: 'var(--pp-shadow-float)',
  },
} as const;

const kebab = (name: string) =>
  name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

/** The legacy tokens as `:root` CSS variables (`--accent-hover`, `--r-dock`, ...). */
export function tokensAsCssVariables(): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [name, value] of Object.entries(tokens.color)) {
    vars[`--${kebab(name)}`] = value;
  }
  vars['--font-display'] = tokens.font.display;
  vars['--font-body'] = tokens.font.body;
  for (const [name, value] of Object.entries(tokens.radius)) {
    vars[`--r-${name}`] = `${value}px`;
  }
  vars['--shadow-dock'] = tokens.shadow.dock;
  return vars;
}
