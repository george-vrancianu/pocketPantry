import { Box, CheckIcon, tokens } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { canRetry, isRead, type SessionScan } from '../../../lib/scanSession';
import { MODE_ICONS } from './ModeDial';

const reducedMotion = '@media (prefers-reduced-motion: reduce)';

/**
 * The Scans of the Scan Session as thumbnails down the left edge, newest at the bottom; the
 * oldest fade out under the top bar when they do not fit. Each is spinning while it is read.
 */
export function ScanQueue({
  scans,
  onRetry,
}: {
  scans: SessionScan[];
  onRetry: (id: string) => void;
}) {
  const { t } = useTranslation('scan');
  if (scans.length === 0) return null;
  return (
    <Box
      component="ul"
      aria-label={t('queue.label')}
      sx={{
        position: 'absolute',
        left: 14,
        top: 'calc(118px + env(safe-area-inset-top))',
        m: 0,
        p: 0,
        listStyle: 'none',
        maxHeight: 400,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        gap: '8px',
        maskImage: 'linear-gradient(to bottom, transparent, #000 40%)',
        pointerEvents: 'none',
      }}
    >
      {scans.map((scan) => {
        const uncropped = scan.status === 'uncropped';
        const failed = scan.status === 'failed';
        const reading = !uncropped && !failed && !isRead(scan);
        const state = uncropped
          ? 'uncropped'
          : failed
            ? 'failed'
            : reading
              ? 'reading'
              : 'read';
        return (
          <Box
            component="li"
            key={scan.id}
            data-testid="scan-thumbnail"
            data-state={state}
            aria-label={
              scan.failure === 'cap'
                ? t('capReached')
                : scan.errorCode && !canRetry(scan)
                  ? t(`errors:${scan.errorCode}`, scan.errorParams)
                  : t(
                      uncropped
                        ? 'queue.needsCrop'
                        : failed
                          ? 'queue.failed'
                          : reading
                            ? 'queue.reading'
                            : 'queue.read',
                    )
            }
            sx={{
              position: 'relative',
              flex: 'none',
              width: 46,
              height: 60,
              borderRadius: '11px',
              overflow: 'hidden',
              border: `1.5px solid ${failed ? tokens.color.camWarn : 'rgba(255,255,255,.35)'}`,
              backgroundColor: tokens.color.camGlassStrong,
            }}
          >
            <Box
              component="img"
              src={scan.thumbnail}
              alt=""
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {reading ? (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,.35)',
                }}
              />
            ) : null}
            <Box
              aria-hidden="true"
              sx={{
                position: 'absolute',
                top: 4,
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
                color: tokens.color.camFg,
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,.6))',
                '& svg': {
                  width: 12,
                  height: 12,
                  fill: 'none',
                  stroke: 'currentColor',
                  strokeWidth: 2,
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                },
              }}
            >
              {MODE_ICONS[scan.mode]}
            </Box>
            {reading ? (
              <Box
                aria-hidden="true"
                sx={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: 18,
                  height: 18,
                  m: '-9px 0 0 -9px',
                  borderRadius: '50%',
                  border: '2.5px solid rgba(255,255,255,.3)',
                  borderTopColor: tokens.color.camFg,
                  animation: 'pp-queue-spin 0.8s linear infinite',
                  '@keyframes pp-queue-spin': {
                    to: { transform: 'rotate(1turn)' },
                  },
                  [reducedMotion]: { animation: 'none' },
                }}
              />
            ) : failed ? (
              <>
                {canRetry(scan) ? (
                  <Box
                    component="button"
                    type="button"
                    aria-label={t('queue.retry')}
                    onClick={() => onRetry(scan.id)}
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      p: 0,
                      border: 0,
                      background: 'rgba(0,0,0,.35)',
                      cursor: 'pointer',
                      pointerEvents: 'auto',
                    }}
                  />
                ) : null}
                <Box
                  aria-hidden="true"
                  sx={{
                    position: 'absolute',
                    right: 3,
                    bottom: 3,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 800,
                    backgroundColor: tokens.color.camWarn,
                    color: tokens.color.camAccentInk,
                  }}
                >
                  !
                </Box>
              </>
            ) : uncropped ? null : (
              <Box
                aria-hidden="true"
                sx={{
                  position: 'absolute',
                  right: 3,
                  bottom: 3,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: tokens.color.camAccent,
                  color: tokens.color.camAccentInk,
                }}
              >
                <CheckIcon size={11} />
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
