import {
  Box,
  ChevronDownIcon,
  QuoteIcon,
  Typography,
  tokens,
  radius,
  focusRing,
} from '@pocket-pantry/ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ScanLanguage } from '../../i18n/resources';

const { color } = tokens;

const clock = (seconds: number) => {
  const whole = Math.round(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
};

/**
 * "What I heard": a card that shows the first line of the transcript and opens to
 * all of it, in the Scan Language it was read in, with that language and its length.
 */
export function HeardCard({
  transcript,
  language,
  seconds,
  defaultOpen,
}: {
  transcript: string;
  language: ScanLanguage;
  seconds: number | undefined;
  defaultOpen: boolean;
}) {
  const { t } = useTranslation(['voice', 'settings']);
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();
  const firstLine = transcript.split('\n')[0];
  const meta = t('voice:review.heardMeta', {
    language: t(`settings:languageNames.${language}`),
    duration: clock(seconds ?? 0),
  });

  return (
    <Box
      sx={{
        backgroundColor: color.surface,
        border: `1px solid ${color.line}`,
        borderRadius: radius.card,
        overflow: 'hidden',
      }}
    >
      <Box
        component="button"
        type="button"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={() => setOpen((value) => !value)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '11px',
          width: '100%',
          p: '12px 14px',
          border: 0,
          background: 'none',
          font: 'inherit',
          color: color.ink,
          textAlign: 'left',
          cursor: 'pointer',
          ...focusRing,
        }}
      >
        <Box
          aria-hidden
          sx={{
            width: 30,
            height: 30,
            flexShrink: 0,
            borderRadius: radius.control,
            display: 'grid',
            placeItems: 'center',
            backgroundColor: color.chipNeutral,
            color: color.muted,
          }}
        >
          <QuoteIcon size={16} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ fontSize: 14, fontWeight: 700 }}>
            {t('voice:review.heard')}
          </Box>
          {open ? null : (
            <Box
              lang={language}
              sx={{
                fontSize: 12.5,
                color: color.muted,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {firstLine}
            </Box>
          )}
        </Box>
        <Box
          component="span"
          aria-hidden
          sx={{
            display: 'flex',
            flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 220ms',
            '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
          }}
        >
          <ChevronDownIcon size={18} />
        </Box>
      </Box>
      <Box id={bodyId} hidden={!open} sx={{ p: '0 16px 14px 55px' }}>
        {open ? (
          <>
            <Typography
              lang={language}
              sx={{ fontSize: 16, fontWeight: 500, lineHeight: 1.45 }}
            >
              {transcript}
            </Typography>
            <Typography
              sx={{
                mt: '6px',
                fontSize: 12,
                fontWeight: 600,
                color: color.muted,
              }}
            >
              {meta}
            </Typography>
          </>
        ) : null}
      </Box>
    </Box>
  );
}
