/** Design tokens from pocket-pantry-handoff/HANDOFF.md section 4. */
export const tokens = {
  color: {
    bg: '#EEF1EA',
    surface: '#FFFFFF',
    ink: '#17231C',
    muted: '#55635A',
    line: '#DCE3D8',
    divider: '#EEF1EA',
    accent: '#2E6A4D',
    accentHover: '#1F4D37',
    accentTint: '#DDEBE2',
    accentMid: '#8DBBA0',
    accentSoftOnDark: '#CFE3D7',
    butter: '#F3D27A',
    butterInk: '#4A3B0B',
    urgentBg: '#FBE6DA',
    urgentHover: '#F6D3BE',
    urgentFg: '#B54A17',
    soonBg: '#F6EBC8',
    soonFg: '#6E5200',
    okBg: '#EEF1EA',
    okFg: '#55635A',
    cameraBg: '#101813',
    cameraSurface: '#1C2922',
    cameraLine: '#2E3D34',
    cameraMuted: '#B8C4BC',
  },
  font: {
    display: "'Bricolage Grotesque', sans-serif",
    body: "'DM Sans', sans-serif",
  },
  radius: {
    dock: 26,
    widget: 22,
    card: 20,
    input: 16,
    chip: 999,
  },
  shadow: {
    dock: '0 10px 30px rgba(23,35,28,0.12)',
  },
} as const;

const kebab = (name: string) =>
  name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

/** The handoff's tokens as `:root` CSS variables (`--accent-hover`, `--r-dock`, ...). */
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
