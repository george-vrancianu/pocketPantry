import MuiButton, {
  type ButtonProps as MuiButtonProps,
} from '@mui/material/Button';
import { tokens } from '../theme/tokens';

export type ButtonProps = Omit<MuiButtonProps, 'variant' | 'color'> & {
  /** `primary` is the accent fill; `secondary` is the ink fill; `text` is a quiet link-like action. */
  variant?: 'primary' | 'secondary' | 'text';
};

export function Button({ variant = 'primary', sx, ...props }: ButtonProps) {
  const muiVariant = variant === 'text' ? 'text' : 'contained';
  return (
    <MuiButton
      disableElevation
      variant={muiVariant}
      sx={[
        {
          minHeight: 48,
          borderRadius: `${tokens.radius.input}px`,
          px: 3,
        },
        variant === 'secondary' && {
          backgroundColor: tokens.color.ink,
          color: '#FFFFFF',
          '&:hover': { backgroundColor: '#000000' },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    />
  );
}
