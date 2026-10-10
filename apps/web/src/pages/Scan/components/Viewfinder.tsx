import { Box } from '@pocket-pantry/ui';
import {
  RECEIPT_GUIDE_ASPECT,
  RECEIPT_GUIDE_HEIGHT_FRACTION,
} from '../../../lib/receiptGuide';

const edge = '3px solid #FFFFFF';
const CORNERS = [
  ['Top', 'Left'],
  ['Top', 'Right'],
  ['Bottom', 'Left'],
  ['Bottom', 'Right'],
] as const;

type Props = {
  scanning: boolean;
  /** Overlay the tall 1:3 receipt guide (and size the preview to match what gets cropped). */
  receiptGuide?: boolean;
};

/** The brackets or receipt guide and the sweeping scan line, centred over the full-screen feed. */
export function Viewfinder({ scanning, receiptGuide }: Props) {
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
      aria-hidden="true"
      sx={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {receiptGuide ? (
        <Box
          data-testid="receipt-guide"
          sx={{
            position: 'relative',
            height: `${RECEIPT_GUIDE_HEIGHT_FRACTION * 100}%`,
            aspectRatio: String(RECEIPT_GUIDE_ASPECT),
            // An outline sits outside the box, so the visible interior is exactly the crop.
            outline: edge,
            borderRadius: '8px',
            // Dim everything outside the guide: only what is inside is sent.
            boxShadow: '0 0 0 100vmax rgba(0,0,0,0.5)',
          }}
        >
          {scanLine}
        </Box>
      ) : (
        <Box sx={{ position: 'relative', width: 280, height: 300 }}>
          {CORNERS.map(([vertical, horizontal]) => (
            <Box
              key={vertical + horizontal}
              sx={{
                position: 'absolute',
                width: 40,
                height: 40,
                boxSizing: 'border-box',
                [vertical.toLowerCase()]: 0,
                [horizontal.toLowerCase()]: 0,
                [`border${vertical}`]: edge,
                [`border${horizontal}`]: edge,
                [`border${vertical}${horizontal}Radius`]: '20px',
              }}
            />
          ))}
          {scanLine}
        </Box>
      )}
    </Box>
  );
}
