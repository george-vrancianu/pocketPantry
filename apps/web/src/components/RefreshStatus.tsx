import Box from '@mui/material/Box';
import { CheckIcon, tokens, usePrefersReducedMotion } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { useRefreshScreen } from '../lib/refresh';

/** The status line under a tab root's title: empty at rest; a polite live region so the outcome is announced. */
export function RefreshStatus() {
  const { t } = useTranslation('screenHeader');
  const { state } = useRefreshScreen();
  const reduceMotion = usePrefersReducedMotion();
  return (
    <Box
      role="status"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontWeight: 600,
        color:
          state === 'done'
            ? tokens.color.accentOnTint
            : state === 'failed'
              ? tokens.color.soonFg
              : tokens.color.muted,
      }}
    >
      {state === 'busy' ? (
        <>
          <Box
            aria-hidden
            data-testid={reduceMotion ? 'refresh-dot' : 'refresh-spinner'}
            sx={
              reduceMotion
                ? {
                    width: 6,
                    height: 6,
                    m: '2.5px',
                    borderRadius: '50%',
                    bgcolor: tokens.color.accent,
                  }
                : {
                    width: 11,
                    height: 11,
                    boxSizing: 'border-box',
                    borderRadius: '50%',
                    border: `2px solid ${tokens.color.line}`,
                    borderTopColor: tokens.color.accent,
                    '@keyframes pp-refresh-spin': {
                      to: { transform: 'rotate(360deg)' },
                    },
                    animation: 'pp-refresh-spin 0.8s linear infinite',
                  }
            }
          />
          {t('refresh.busy')}
        </>
      ) : state === 'done' ? (
        <>
          <CheckIcon size={13} />
          {t('refresh.done')}
        </>
      ) : state === 'failed' ? (
        t('refresh.failed')
      ) : null}
    </Box>
  );
}
