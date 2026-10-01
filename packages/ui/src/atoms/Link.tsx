import MuiLink, { type LinkProps as MuiLinkProps } from '@mui/material/Link';
import { tokens } from '../theme/tokens';

export type LinkProps = MuiLinkProps;

export function Link({ sx, ...props }: LinkProps) {
  return (
    <MuiLink
      underline="hover"
      sx={[
        {
          color: tokens.color.accent,
          fontWeight: 700,
          '&:hover': { color: tokens.color.accentHover },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    />
  );
}
