import Box from '@mui/material/Box';
import { useId, type MouseEventHandler } from 'react';
import { focusRingStyle } from '../theme/focusRing';
import logoArt from './art/app-logo-static.svg?raw';

export type GatorLogoProps = {
  /** Accessible name of the button, e.g. "Refresh". */
  label: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** The mark's size in px (the button is 6 px larger): 38 in a header, 42 on the Dashboard. */
  size?: 38 | 42;
};

/** The art's inner markup (defs and rig) without its outer `<svg>`, so the component owns the element and its ids. */
const ART_INNER = logoArt
  .replace(/^[\s\S]*?<svg[^>]*>/, '')
  .replace(/<\/svg>\s*$/, '');

/**
 * The app mark as a button: the Gator head clipped inside the olive tile, drawn inline so the Dark
 * theme can give the head a light rim and drop its shadow (CSS can't reach inside an `<img>`).
 * The tile keeps its gradient in every theme.
 */
export function GatorLogo({ label, onClick, size = 38 }: GatorLogoProps) {
  const suffix = useId().replace(/:/g, '');
  const markup = ART_INNER.replaceAll('-app-icon', `-logo${suffix}`);
  const box = size + 6;
  return (
    <Box
      component="button"
      type="button"
      aria-label={label}
      onClick={onClick}
      sx={{
        flexShrink: 0,
        width: box,
        height: box,
        p: 0,
        m: 0,
        border: 0,
        background: 'none',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        WebkitTapHighlightColor: 'transparent',
        '&:focus-visible': { outline: 'none' },
        '&:focus-visible > svg': {
          ...focusRingStyle,
          // The tile's corner radius: rx 44 of 188 in the 200 viewBox.
          borderRadius: `${(size * 44) / 200}px`,
        },
        '[data-theme="dark"] & .head': { filter: 'none' },
        '[data-theme="dark"] & .hd': {
          stroke: '#9FD36A',
          strokeWidth: 2.5,
          strokeOpacity: 0.35,
        },
      }}
    >
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        aria-hidden="true"
        focusable="false"
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    </Box>
  );
}
