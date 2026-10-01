import Box from '@mui/material/Box';
import { tokens } from '../theme/tokens';

export type ProgressBarProps = {
  /** Accessible name of the bar. */
  label: string;
  /** Completed amount, between 0 and `max`. */
  value: number;
  max: number;
};

/** Handoff section 5: 6 px bar with an accent fill. */
export function ProgressBar({ label, value, max }: ProgressBarProps) {
  const percent =
    max > 0 ? Math.min(100, Math.max(0, Math.round((value / max) * 100))) : 0;
  return (
    <Box
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      sx={{
        height: 6,
        borderRadius: '3px',
        backgroundColor: tokens.color.bg,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          height: 6,
          width: `${percent}%`,
          backgroundColor: tokens.color.accent,
        }}
      />
    </Box>
  );
}
