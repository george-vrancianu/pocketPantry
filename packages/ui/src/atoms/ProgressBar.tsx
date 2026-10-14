import Box from '@mui/material/Box';

export type ProgressBarProps = {
  /** Accessible name of the bar. */
  label: string;
  /** Completed amount, between 0 and `max`. */
  value: number;
  max: number;
  /** `large` is 8 px high, `default` 6. */
  size?: 'default' | 'large';
};

/** Themes handoff section 4: an `accent` fill on the `chip` track. */
export function ProgressBar({
  label,
  value,
  max,
  size = 'default',
}: ProgressBarProps) {
  const height = size === 'large' ? 8 : 6;
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
        height,
        borderRadius: '999px',
        backgroundColor: 'pp.chip',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          height,
          width: `${percent}%`,
          borderRadius: '999px',
          backgroundColor: 'pp.accent',
        }}
      />
    </Box>
  );
}
