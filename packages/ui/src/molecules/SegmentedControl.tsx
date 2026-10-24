import ButtonBase from '@mui/material/ButtonBase';
import Box from '@mui/material/Box';
import type { ReactNode } from 'react';
import { focusRing } from '../theme/focusRing';
import {
  bodyFont,
  nestedRadius,
  radius,
  shadow,
  themePalette,
} from '../theme/themeVars';

export type SegmentedControlOption<T extends string> = {
  value: T;
  label: string;
  /** Language of the label, when it differs from the page's (e.g. a language's own name). */
  lang?: string;
  /** A decorative icon drawn above the label. */
  icon?: ReactNode;
};

/** Dense padding on each side of a label, the gap between segments, and the track's own padding. */
const DENSE_PAD = 2;
const DENSE_GAP = 2;
const DENSE_TRACK_PAD = 2;

/** The Theme fonts' average character width at the 600 weight of an unpressed label. */
const EM_PER_CHAR = 0.6;
/** How much wider the pressed option is, drawn at 700. */
const BOLD_EXTRA = 0.1;

/**
 * A dense label's size: the track's width shared out over every label's
 * characters (about 0.6 em each, plus 10 % of the longest label for the
 * pressed option drawn bold), from 13 px down to 11 px, so the longest labels
 * (Romanian Locations) fit whole in the 246 px a 320 px phone gives them.
 * Never cut or shortened: a label still too long at the 11 px floor overflows
 * its segment (a single word cannot wrap; labels of several words wrap
 * between words).
 */
function denseFontSize(labels: string[]) {
  const chars = labels.reduce((sum, label) => sum + label.length, 0);
  const longest = Math.max(...labels.map((label) => label.length));
  // 100cqi is the track's content box, already inside DENSE_TRACK_PAD; only the gaps and segment padding come off it.
  const room = DENSE_GAP * (labels.length - 1) + DENSE_PAD * 2 * labels.length;
  const ems = Number(
    (EM_PER_CHAR * chars + EM_PER_CHAR * BOLD_EXTRA * longest).toFixed(2),
  );
  return `clamp(11px, calc((100cqi - ${room}px) / ${ems}), 13px)`;
}

type GroupName =
  | {
      /** Accessible name of the group. */
      label: string;
      labelledBy?: never;
    }
  | {
      /** The id of a visible caption that names the group. */
      labelledBy: string;
      label?: never;
    };

export type SegmentedControlProps<T extends string> = GroupName & {
  options: SegmentedControlOption<T>[];
  /** The pressed option; null presses none (nothing chosen yet). */
  value: T | null;
  onChange: (value: T) => void;
  /** Stretch to the container's width, sharing it evenly between the options. */
  fullWidth?: boolean;
  /**
   * For long labels on a narrow phone: always full width, less padding, no
   * minimum width, the width shared by label length (a long label gets more
   * of it), and the label shrinks with the track down to 11 px rather than
   * being cut.
   */
  dense?: boolean;
};

/** A row of toggle buttons where exactly one is pressed. */
export function SegmentedControl<T extends string>({
  label,
  labelledBy,
  options,
  value,
  onChange,
  fullWidth: wide = false,
  dense = false,
}: SegmentedControlProps<T>) {
  // Dense sizes its labels against the track's width, so the track always fills its container.
  const fullWidth = wide || dense;
  const fontSize = dense
    ? denseFontSize(options.map((option) => option.label))
    : 14;
  return (
    <Box
      role="group"
      aria-label={label}
      aria-labelledby={labelledBy}
      sx={(theme) => ({
        display: fullWidth ? 'flex' : 'inline-flex',
        gap: dense ? `${DENSE_GAP}px` : '4px',
        p: dense ? `${DENSE_TRACK_PAD}px` : '4px',
        ...(dense ? { containerType: 'inline-size' } : {}),
        backgroundColor: themePalette(theme).pp.chip,
        borderRadius: radius.control,
      })}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <ButtonBase
            key={option.value}
            aria-pressed={selected}
            lang={option.lang}
            onClick={() => onChange(option.value)}
            sx={[
              (theme) => {
                const p = themePalette(theme);
                const trackPad = dense ? DENSE_TRACK_PAD : 4;
                return {
                  minHeight: 36,
                  minWidth: dense ? 0 : 56,
                  flex: dense ? '1 1 auto' : fullWidth ? 1 : undefined,
                  px: dense ? `${DENSE_PAD}px` : '16px',
                  ...(option.icon
                    ? { flexDirection: 'column', gap: '2px', py: '6px' }
                    : {}),
                  borderRadius: nestedRadius(radius.control, trackPad),
                  fontSize,
                  fontWeight: selected ? 700 : 600,
                  fontFamily: bodyFont,
                  backgroundColor: selected ? p.pp.segOn : 'transparent',
                  color: selected ? p.pp.segOnInk : p.text.secondary,
                  boxShadow: selected ? shadow.segment : 'none',
                };
              },
              focusRing,
            ]}
          >
            {option.icon}
            {option.label}
          </ButtonBase>
        );
      })}
    </Box>
  );
}
