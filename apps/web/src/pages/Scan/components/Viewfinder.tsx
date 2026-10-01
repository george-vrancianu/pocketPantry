import { Box } from '@pocket-pantry/ui';
import type { RefObject } from 'react';

const corner = (
  position: Record<string, number>,
  borders: Record<string, string>,
) => ({
  position: 'absolute' as const,
  width: 40,
  height: 40,
  boxSizing: 'border-box' as const,
  ...position,
  ...borders,
});
const edge = '3px solid #FFFFFF';

type Props = {
  videoRef: RefObject<HTMLVideoElement | null>;
  scanning: boolean;
};

/** The camera preview with corner brackets and the sweeping scan line. */
export function Viewfinder({ videoRef, scanning }: Props) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: 280,
        maxWidth: '100%',
        height: 300,
        mx: 'auto',
      }}
    >
      <Box
        component="video"
        ref={videoRef}
        autoPlay
        playsInline
        muted
        aria-hidden="true"
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '20px',
        }}
      />
      <Box aria-hidden="true" sx={{ position: 'absolute', inset: 0 }}>
        <Box
          sx={corner(
            { left: 0, top: 0 },
            { borderTop: edge, borderLeft: edge, borderTopLeftRadius: '20px' },
          )}
        />
        <Box
          sx={corner(
            { right: 0, top: 0 },
            {
              borderTop: edge,
              borderRight: edge,
              borderTopRightRadius: '20px',
            },
          )}
        />
        <Box
          sx={corner(
            { left: 0, bottom: 0 },
            {
              borderBottom: edge,
              borderLeft: edge,
              borderBottomLeftRadius: '20px',
            },
          )}
        />
        <Box
          sx={corner(
            { right: 0, bottom: 0 },
            {
              borderBottom: edge,
              borderRight: edge,
              borderBottomRightRadius: '20px',
            },
          )}
        />
        <Box
          data-testid="scan-line"
          sx={{
            position: 'absolute',
            left: 24,
            right: 24,
            top: 148,
            height: 2,
            borderRadius: '1px',
            backgroundColor: '#8DBBA0',
            '@keyframes pp-scan-sweep': {
              '0%': { transform: 'translateY(-110px)' },
              '100%': { transform: 'translateY(110px)' },
            },
            animation: scanning
              ? 'pp-scan-sweep 1.2s ease-in-out infinite alternate'
              : 'pp-scan-sweep 2.4s ease-in-out infinite alternate',
            // Handoff section 10: respect prefers-reduced-motion for the scan line.
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        />
      </Box>
    </Box>
  );
}
