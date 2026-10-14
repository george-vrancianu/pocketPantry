import ButtonBase, { type ButtonBaseProps } from '@mui/material/ButtonBase';
import { focusRing } from '../theme/focusRing';

export type FieldUnitProps = Omit<ButtonBaseProps, 'color'>;

/** The unit chip inside a Field (handoff section 4): `chip` fill, radius `r-ctl` - 5. */
export function FieldUnit({ sx, ...props }: FieldUnitProps) {
  return (
    <ButtonBase
      sx={[
        (theme) => {
          const p = (theme.vars ?? theme).palette;
          return {
            height: 32,
            px: '10px',
            borderRadius: 'calc(var(--pp-r-ctl) - 5px)',
            backgroundColor: p.pp.chip,
            color: p.text.primary,
            fontFamily: 'var(--pp-body)',
            fontSize: 13.5,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            '&.Mui-disabled': { opacity: 0.45 },
          };
        },
        focusRing,
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    />
  );
}
