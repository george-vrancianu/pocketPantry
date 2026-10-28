import Box, { type BoxProps } from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { focusRing } from '../theme/focusRing';
import { bodyFont, radius, themePalette } from '../theme/themeVars';
import { CloseIcon } from './icons';

export type TagChipKind = 'catalog' | 'family';
export type TagChipSize = 'small' | 'medium';

export type TagChipProps = Omit<BoxProps, 'children'> & {
  /** Catalog Tags are neutral; Family Tags are butter, so a Member's own words stand out. */
  kind: TagChipKind;
  /** `small` (21 high) sits on rows; `medium` (28 high) on the Recipe page and Quick View. */
  size?: TagChipSize;
  /** A Tag that matches the active filter: accent tint, bold, with an inset accent ring. */
  matched?: boolean;
  /**
   * Makes the whole chip a button that removes the Tag, with a small × after the name. Needs
   * `removeLabel`, e.g. "Remove Tag Vegan".
   */
  onRemove?: () => void;
  /** Accessible name of the remove button. */
  removeLabel?: string;
  children: ReactNode;
};

const SIZES = {
  small: { height: 21, px: '8px', fontSize: 11.5 },
  medium: { height: 28, px: '12px', fontSize: 13 },
} as const;

const paint = (kind: TagChipKind, matched: boolean) => (theme: Theme) => {
  const p = themePalette(theme);
  if (matched) {
    return {
      backgroundColor: p.pp.accentTint,
      color: p.pp.accentOnTint,
      fontWeight: 700,
      boxShadow: `inset 0 0 0 1px ${p.pp.accent}`,
    };
  }
  return kind === 'family'
    ? {
        backgroundColor: p.secondary.main,
        color: p.secondary.contrastText,
        fontWeight: 600,
      }
    : { backgroundColor: p.pp.chip, color: p.text.primary, fontWeight: 600 };
};

/**
 * A Tag on a Recipe (ADR 0033). Not the status label `Tag`. Long names shrink to the row and
 * end in an ellipsis. Purely visual: the row or page that shows it names the Tags for screen readers.
 */
export function TagChip({
  kind,
  size = 'small',
  matched = false,
  onRemove,
  removeLabel,
  children,
  sx,
  ...props
}: TagChipProps) {
  const { height, px, fontSize } = SIZES[size];
  const removable = onRemove !== undefined;
  return (
    <Box
      component={removable ? 'button' : 'span'}
      {...(removable
        ? { type: 'button', onClick: onRemove, 'aria-label': removeLabel }
        : {})}
      sx={[
        {
          display: 'inline-flex',
          alignItems: 'center',
          flexShrink: 1,
          minWidth: 0,
          maxWidth: '100%',
          height,
          boxSizing: 'border-box',
          px,
          borderRadius: radius.chip,
          fontFamily: bodyFont,
          fontSize,
          lineHeight: 1,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
        paint(kind, matched),
        removable && {
          gap: '6px',
          pr: '9px',
          pl: '11px',
          border: 0,
          font: 'inherit',
          fontFamily: bodyFont,
          fontSize,
          fontWeight: matched ? 700 : 600,
          cursor: 'pointer',
          ...focusRing,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    >
      <Box
        component="span"
        sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
      >
        {children}
      </Box>
      {removable ? (
        <Box
          component="span"
          aria-hidden
          sx={{ display: 'flex', flexShrink: 0, opacity: 0.75 }}
        >
          <CloseIcon size={10} />
        </Box>
      ) : null}
    </Box>
  );
}
