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
  // In receipt mode the line lives inside the guide and sweeps its full height (percentages);
  // otherwise it sweeps the 300 px box.
  const sweep = receiptGuide
    ? { from: { top: '0%' }, to: { top: '100%' } }
    : {
        from: { transform: 'translateY(-110px)' },
        to: { transform: 'translateY(110px)' },
      };
  const sweepName = receiptGuide ? 'pp-scan-sweep-guide' : 'pp-scan-sweep';
  const scanLine = (
    <Box
      data-testid="scan-line"
      sx={{
        position: 'absolute',
        left: receiptGuide ? 8 : 24,
        right: receiptGuide ? 8 : 24,
        top: receiptGuide ? undefined : 148,
        height: 2,
        borderRadius: '1px',
        backgroundColor: '#8DBBA0',
        [`@keyframes ${sweepName}`]: {
          '0%': sweep.from,
          '100%': sweep.to,
        },
        animation: scanning
          ? `${sweepName} 1.2s ease-in-out infinite alternate`
          : `${sweepName} 2.4s ease-in-out infinite alternate`,
        // Handoff section 10: respect prefers-reduced-motion for the scan line.
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
      }}
    />
  );
  return (
    <Box
      sx={{
        position: 'relative',
        // The receipt box keeps its 9:16 shape but shrinks to fit narrow or short screens.
        width: receiptGuide
          ? `min(${RECEIPT_VIEW.width}px, calc(55vh * ${RECEIPT_VIEW.width / RECEIPT_VIEW.height}))`
          : 280,
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
              // An outline sits outside the box, so the visible interior is exactly the crop.
              outline: edge,
              borderRadius: '8px',
              // Dim everything outside the guide: only what is inside is sent.
              boxShadow: '0 0 0 100vmax rgba(0,0,0,0.5)',
            }}
          >
            {scanLine}
          </Box>
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
        {receiptGuide ? null : scanLine}
      </Box>
    </Box>
  );
}
