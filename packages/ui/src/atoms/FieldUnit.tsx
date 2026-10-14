import ButtonBase, { type ButtonBaseProps } from '@mui/material/ButtonBase';
import { focusRing } from '../theme/focusRing';
import {
  bodyFont,
  nestedRadius,
  radius,
  themePalette,
} from '../theme/themeVars';

export type FieldUnitProps = Omit<ButtonBaseProps, 'color'>;

/** The unit chip inside a Field (handoff section 4): `chip` fill, radius `r-ctl` - 5. */
export function FieldUnit({ sx, ...props }: FieldUnitProps) {
  return (
    <ButtonBase
      sx={[
        (theme) => {
          const p = themePalette(theme);
          return {
            height: 32,
            px: '10px',
            borderRadius: nestedRadius(radius.control, 5),
            backgroundColor: p.pp.chip,
            color: p.text.primary,
            fontFamily: bodyFont,
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
