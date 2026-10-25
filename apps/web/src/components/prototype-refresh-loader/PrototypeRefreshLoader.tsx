// PROTOTYPE, throwaway: three takes on a text-free refresh loader that pops down from the top of the app.
// Question: "What should the refresh look like once its status text leaves the header?"
// Switch with `?refresh=A|B|C`; tap the Gator logo on Home, Pantry, Shopping or Recipes to run it.
// `?protoSlow=1` keeps it down 2.5 s longer, `?protoFail=1` forces the failure look.
import { Box, color, palette, shadow, visuallyHidden } from '@pocket-pantry/ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { PROTO_RETRACT_MS, useRefreshScreen } from '../../lib/refresh';
import { PrototypeSwitcher } from '../PrototypeSwitcher';

const VARIANTS = [
  { key: 'A', name: 'Island pill' },
  { key: 'B', name: 'Spinner coin' },
  { key: 'C', name: 'Hanging tab' },
];
const FAIL_FLASH_MS = 1100;
const POP = 'cubic-bezier(.34,1.56,.64,1)';
const TUCK = 'cubic-bezier(.5,0,.75,0)';

export function PrototypeRefreshLoader() {
  const { t } = useTranslation('screenHeader');
  const { state } = useRefreshScreen();
  const [params, setParams] = useSearchParams();
  const variant = params.get('refresh') ?? 'A';

  // A failure shows briefly (shake, warning colour), then the loader tucks away like a success.
  const [failFlash, setFailFlash] = useState(false);
  useEffect(() => {
    if (state !== 'failed') return;
    setFailFlash(true);
    const id = setTimeout(() => setFailFlash(false), FAIL_FLASH_MS);
    return () => clearTimeout(id);
  }, [state]);
  const failed = state === 'failed' && failFlash;
  const shown = state === 'busy' || failed;

  const knob = (name: string) => params.get(name) === '1';
  const toggle = (name: string) => {
    const copy = new URLSearchParams(params);
    if (knob(name)) copy.delete(name);
    else copy.set(name, '1');
    setParams(copy, { replace: true });
  };
  const chip = (on: boolean) => ({
    background: on ? '#f0f' : 'transparent',
    color: '#fff',
    border: '1px solid #666',
    borderRadius: 8,
    font: 'inherit',
    padding: '2px 8px',
    cursor: 'pointer',
  });

  return (
    <>
      {/* The words leave the screen but not the screen reader. */}
      <Box role="status" sx={visuallyHidden}>
        {state === 'busy'
          ? t('refresh.busy')
          : state === 'done'
            ? t('refresh.done')
            : state === 'failed'
              ? t('refresh.failed')
              : ''}
      </Box>
      <Box
        aria-hidden
        data-proto-refresh={shown ? 'down' : 'up'}
        sx={{
          position: 'fixed',
          top: 0,
          left: '50%',
          zIndex: 1500,
          pointerEvents: 'none',
          transform: shown
            ? 'translate(-50%, 0)'
            : 'translate(-50%, calc(-100% - 24px))',
          transition: shown
            ? `transform 420ms ${POP}`
            : `transform ${PROTO_RETRACT_MS}ms ${TUCK}`,
          '@keyframes protoShake': {
            '0%,100%': { translate: '0 0' },
            '20%,60%': { translate: '-6px 0' },
            '40%,80%': { translate: '6px 0' },
          },
          '@keyframes protoSpin': { to: { transform: 'rotate(360deg)' } },
          '@keyframes protoDot': {
            '0%,80%,100%': { transform: 'translateY(0)', opacity: 0.45 },
            '40%': { transform: 'translateY(-5px)', opacity: 1 },
          },
          '@keyframes protoSweep': {
            from: { transform: 'translateX(-110%)' },
            to: { transform: 'translateX(260%)' },
          },
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
            '& *': { animation: 'none !important' },
          },
        }}
      >
        <Box
          sx={{
            animation: failed ? 'protoShake 420ms ease-in-out' : 'none',
          }}
        >
          {variant === 'B' ? (
            <Coin failed={failed} />
          ) : variant === 'C' ? (
            <Tab failed={failed} />
          ) : (
            <Pill failed={failed} />
          )}
        </Box>
      </Box>
      <PrototypeSwitcher param="refresh" variants={VARIANTS} at="bottom">
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span>state: {state}</span>
          <button
            style={chip(knob('protoSlow'))}
            onClick={() => toggle('protoSlow')}
          >
            slow
          </button>
          <button
            style={chip(knob('protoFail'))}
            onClick={() => toggle('protoFail')}
          >
            fail
          </button>
        </div>
      </PrototypeSwitcher>
    </>
  );
}

const safeTop = 'env(safe-area-inset-top, 0px)';
const warn = palette('warning-main');

/** A: a dark pill with three bouncing dots, floating just under the top edge. */
function Pill({ failed }: { failed: boolean }) {
  return (
    <Box
      sx={{
        mt: `calc(${safeTop} + 10px)`,
        width: 64,
        height: 30,
        borderRadius: '999px',
        bgcolor: failed ? warn : 'text.primary',
        boxShadow: shadow.float,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        transition: 'background-color 200ms',
      }}
    >
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            bgcolor: failed ? 'background.paper' : 'pp.accent',
            animation: failed
              ? 'none'
              : `protoDot 900ms ease-in-out ${i * 120}ms infinite`,
          }}
        />
      ))}
    </Box>
  );
}

/** B: a round paper disc with an accent arc spinning, like a pull-to-refresh that pulled itself. */
function Coin({ failed }: { failed: boolean }) {
  return (
    <Box
      sx={{
        mt: `calc(${safeTop} + 14px)`,
        width: 44,
        height: 44,
        borderRadius: '50%',
        bgcolor: 'background.paper',
        boxShadow: shadow.float,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {failed ? (
        <Box
          sx={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            bgcolor: warn,
            color: 'background.paper',
            fontWeight: 800,
            fontSize: 14,
            lineHeight: '20px',
            textAlign: 'center',
          }}
        >
          !
        </Box>
      ) : (
        <Box
          sx={{
            width: 22,
            height: 22,
            boxSizing: 'border-box',
            borderRadius: '50%',
            border: `3px solid ${color.lineStrong}`,
            borderTopColor: palette('pp-accent'),
            borderRightColor: palette('pp-accent'),
            animation: 'protoSpin 700ms linear infinite',
          }}
        />
      )}
    </Box>
  );
}

/** C: an accent tab hanging off the top edge, a light sweep running through it. */
function Tab({ failed }: { failed: boolean }) {
  return (
    <Box
      sx={{
        pt: safeTop,
        width: 132,
        height: `calc(${safeTop} + 14px)`,
        borderRadius: '0 0 14px 14px',
        bgcolor: failed ? warn : 'pp.accent',
        boxShadow: shadow.button,
        overflow: 'hidden',
        position: 'relative',
        transition: 'background-color 200ms',
      }}
    >
      {failed ? null : (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: '40%',
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent)',
            animation: 'protoSweep 1s ease-in-out infinite',
          }}
        />
      )}
    </Box>
  );
}
