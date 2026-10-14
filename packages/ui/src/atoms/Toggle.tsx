import ButtonBase, { type ButtonBaseProps } from '@mui/material/ButtonBase';
import { focusRing } from '../theme/focusRing';

export type ToggleProps = Omit<
  ButtonBaseProps,
  'onChange' | 'role' | 'children' | 'value'
> & {
  checked: boolean;
  /** Called with the state the Member asked for. */
  onChange: (checked: boolean) => void;
};

/** An on/off switch (handoff section 4): 46 x 28, `box` track turning `accent`, white knob. */
export function Toggle({ checked, onChange, sx, ...props }: ToggleProps) {
  return (
    <ButtonBase
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      sx={[
        (theme) => ({
          position: 'relative',
          flex: '0 0 auto',
          width: 46,
          height: 28,
          borderRadius: '999px',
          backgroundColor: checked
            ? (theme.vars ?? theme).palette.pp.accent
            : (theme.vars ?? theme).palette.pp.box,
          transition: 'background-color 150ms',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 3,
            left: 3,
            width: 22,
            height: 22,
            borderRadius: '50%',
            backgroundColor: (theme.vars ?? theme).palette.common.white,
            boxShadow: `0 1px 2px color-mix(in srgb, ${(theme.vars ?? theme).palette.common.black} 25%, transparent)`,
            transform: checked ? 'translateX(18px)' : 'none',
            transition: 'transform 150ms',
          },
          '&.Mui-disabled': { opacity: 0.45 },
        }),
        focusRing,
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    />
  );
}
