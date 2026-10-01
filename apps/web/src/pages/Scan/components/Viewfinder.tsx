import { Box } from '@pocket-pantry/ui';
import type { RefObject } from 'react';
import {
  RECEIPT_GUIDE_ASPECT,
  RECEIPT_GUIDE_HEIGHT_FRACTION,
  RECEIPT_VIEW,
} from '../../../lib/receiptGuide';

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
  /** Overlay the tall 1:3 receipt guide (and size the preview to match what gets cropped). */
  receiptGuide?: boolean;
};

/** The camera preview with corner brackets and the sweeping scan line. */
export function Viewfinder({ videoRef, scanning, receiptGuide }: Props) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: receiptGuide ? RECEIPT_VIEW.width : 280,
        maxWidth: '100%',
        ...(receiptGuide
          ? { aspectRatio: `${RECEIPT_VIEW.width} / ${RECEIPT_VIEW.height}` }
          : { height: 300 }),
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
      {receiptGuide ? (
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            borderRadius: '20px',
          }}
        >
          <Box
            data-testid="receipt-guide"
            sx={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              height: `${RECEIPT_GUIDE_HEIGHT_FRACTION * 100}%`,
              aspectRatio: String(RECEIPT_GUIDE_ASPECT),
              transform: 'translate(-50%, -50%)',
              boxSizing: 'border-box',
              border: edge,
              borderRadius: '8px',
              // Dim everything outside the guide: only what is inside is sent.
              boxShadow: '0 0 0 100vmax rgba(0,0,0,0.5)',
            }}
          />
        </Box>
      ) : null}
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
