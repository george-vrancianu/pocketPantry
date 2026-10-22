import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { CameraIcon } from '../atoms/icons';
import { DOCK_OVERHANG } from '../theme/dock';
import { focusRing } from '../theme/focusRing';
import { color, palette, radius, shadow } from '../theme/themeVars';

export type DockCapsuleProps = {
  cameraLabel: string;
  cameraHref: string;
  /**
   * Give the mic half a place: called with the element the mic control should be rendered into
   * (a portal target). Leave it out for a camera-only capsule.
   */
  micSlot?: (element: HTMLElement | null) => void;
};

/** The Dock's padding, px: the capsule reaches past it, then past the edge. */
const DOCK_PADDING = 8;

/**
 * The Camera/Mic capsule over the Dock's middle slot: the camera on top, the mic below, a
 * hairline between, overhanging the bar by 18 px at the top and bottom. Without a mic it shrinks
 * to a camera button inside the bar.
 */
export function DockCapsule({
  cameraLabel,
  cameraHref,
  micSlot,
}: DockCapsuleProps) {
  const CAMERA_RADIUS = micSlot
    ? `${radius.pill} ${radius.pill} 0 0`
    : radius.pill;
  const camera = (
    <ButtonBase
      href={cameraHref}
      aria-label={cameraLabel}
      sx={[
        {
          flex: 1,
          width: '100%',
          color: 'inherit',
          borderRadius: CAMERA_RADIUS,
        },
        focusRing,
      ]}
    >
      <CameraIcon size={micSlot ? 22 : 24} />
    </ButtonBase>
  );
  return (
    <Box
      sx={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        top: micSlot ? -DOCK_PADDING - DOCK_OVERHANG : 0,
        bottom: micSlot ? -DOCK_PADDING - DOCK_OVERHANG : 0,
        width: micSlot ? 62 : 52,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: radius.pill,
        bgcolor: 'pp.accent',
        color: color.accentInk,
        boxShadow: shadow.float,
        // A ring in the page colour cuts the capsule out of the bar.
        outline: `4px solid ${palette('background-default')}`,
      }}
    >
      {camera}
      {micSlot ? (
        <>
          <Box
            aria-hidden
            sx={{
              height: '1px',
              mx: '12px',
              bgcolor: 'currentColor',
              opacity: 0.35,
            }}
          />
          <Box
            ref={micSlot}
            sx={{ flex: 1, display: 'flex', position: 'relative' }}
          />
        </>
      ) : null}
    </Box>
  );
}
