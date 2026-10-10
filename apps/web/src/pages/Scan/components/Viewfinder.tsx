import { Box, tokens } from '@pocket-pantry/ui';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ScanMode } from '../../../lib/scan';
import { SCAN_GUIDES } from '../../../lib/scanGuides';

const ARMED_MS = 320;
const noMotion = {
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
};
const CORNERS = [
  ['top', 'left'],
  ['top', 'right'],
  ['bottom', 'left'],
  ['bottom', 'right'],
] as const;
const capital = (word: string) => word[0].toUpperCase() + word.slice(1);

type Props = {
  mode: ScanMode;
  /** Show the one-line instruction under the guide; it goes away after the first Scan. */
  hintShown: boolean;
};

/** The guide brackets that follow the Scan Mode, centred over the full-screen feed. */
export function Viewfinder({ mode, hintShown }: Props) {
  const { t } = useTranslation('scan');
  const { width, height } = SCAN_GUIDES[mode];
  const [armed, setArmed] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const arm = () => {
    setArmed(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setArmed(false), ARMED_MS);
  };
  return (
    <Box
      aria-hidden="true"
      sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      <Box
        data-testid="scan-guide"
        data-armed={armed ? 'true' : undefined}
        onPointerDown={arm}
        sx={{
          position: 'absolute',
          left: '50%',
          top: '46%',
          width: `${width * 100}%`,
          height: `${height * 100}%`,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'auto',
          transition: `width 400ms cubic-bezier(.2,.8,.2,1), height 400ms cubic-bezier(.2,.8,.2,1)`,
          ...noMotion,
        }}
      >
        {CORNERS.map(([v, h]) => (
          <Box
            key={v + h}
            data-testid="scan-guide-corner"
            sx={{
              position: 'absolute',
              width: 30,
              height: 30,
              boxSizing: 'border-box',
              [v]: -2,
              [h]: -2,
              [`border${capital(v)}`]: '3.5px solid',
              [`border${capital(h)}`]: '3.5px solid',
              [`border${capital(v)}${capital(h)}Radius`]: '10px',
              borderColor: armed ? tokens.color.camAccent : tokens.color.camFg,
              filter: 'drop-shadow(0 1px 4px rgba(0,0,0,.5))',
              transition: 'border-color 200ms',
              ...noMotion,
            }}
          />
        ))}
        {hintShown ? (
          <Box
            data-testid="scan-hint"
            sx={{
              position: 'absolute',
              left: '50%',
              top: '100%',
              mt: '14px',
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
              fontSize: 12.5,
              fontWeight: 600,
              color: tokens.color.camDim,
              backgroundColor: tokens.color.camGlass,
              backdropFilter: 'blur(10px)',
              px: '11px',
              py: '5px',
              borderRadius: '999px',
            }}
          >
            {t(`guideHint.${mode}`)}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
