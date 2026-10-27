import {
  Box,
  Button,
  Gator,
  palette,
  radius,
  shadow,
  visuallyHidden,
} from '@pocket-pantry/ui';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { pillBottom, VOICE_LAYER } from '../../lib/voicePlacement';
import { VOICE_PILL_ATTRIBUTE } from '../../lib/voiceFocus';
import { enter } from '../voice/enter';
import { useVoiceHost } from '../voice/VoiceHost';
import { countBackground, type BackgroundItem } from './backgroundItem';

const oneLine = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;

/**
 * The background strip, where the status pill was: what is being read in the background. One item
 * shows its own title and detail; several show "N in the background" with how many are reading,
 * ready and failed. The button is Review when exactly one item is ready (it opens that item), else
 * Open ("Open N" when several are ready), which opens the sheet. Once everything is ready it turns
 * into the dark pill with a happy Gator. A failure outlines it in the warning colour; `alert` is
 * announced assertively (the rest of the strip is a polite status).
 */
export function BackgroundStrip({
  items,
  alert,
  openSheet,
}: {
  items: BackgroundItem[];
  /** The one-time announcement of a failure, while it is up. */
  alert?: string;
  openSheet: () => void;
}) {
  const { t } = useTranslation('background');
  const host = useVoiceHost();
  const { reading, ready, failed, total } = countBackground(items);
  const busy = reading > 0;
  const allReady = total > 0 && ready === total;
  const single = items.length === 1 ? items[0] : undefined;
  const onlyReady =
    ready === 1 ? items.find((i) => i.status === 'ready') : undefined;

  const title = single ? single.title : t('title', { count: total });
  const detail = single
    ? single.detail
    : [
        busy ? t('reading', { count: reading }) : null,
        ready > 0 ? t('ready', { count: ready }) : null,
        failed > 0 ? t('failed', { count: failed }) : null,
      ]
        .filter(Boolean)
        .join(' · ');
  const art = single?.art ?? null;

  // A lone item that can be opened (the Scan Session, whatever its status) or the one ready item opens itself.
  const lead = single?.open ? single : onlyReady;
  const open = () => {
    if (lead?.open) lead.open.onClick();
    else openSheet();
  };

  return createPortal(
    <Box
      {...{ [VOICE_PILL_ATTRIBUTE]: '' }}
      onClick={open}
      sx={{
        position: 'fixed',
        left: 16,
        right: 16,
        bottom: pillBottom,
        mx: 'auto',
        maxWidth: 420,
        zIndex: VOICE_LAYER.card,
        display: 'flex',
        alignItems: 'center',
        gap: '11px',
        p: '11px 12px 11px 14px',
        // Everything ready keeps the dark pill.
        backgroundColor: allReady ? 'text.primary' : 'pp.cardBg',
        color: allReady ? 'background.paper' : 'text.primary',
        borderRadius: radius.control,
        boxShadow: shadow.float,
        cursor: 'pointer',
        border: failed > 0 ? `2px solid ${palette('warning-main')}` : 'none',
        ...enter,
      }}
    >
      <Box
        aria-hidden
        sx={{ flex: 'none', display: 'flex', alignItems: 'center' }}
      >
        {art && !allReady ? (
          art
        ) : (
          <Gator
            mood={busy ? 'thinking' : 'happy'}
            size={44}
            loop={busy ? 'signature' : 'idle'}
            entrance={false}
            decorative
          />
        )}
      </Box>
      <Box role="status" sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ fontSize: 14, fontWeight: 600, ...oneLine }}>{title}</Box>
        <Box
          sx={{
            fontSize: 12,
            color: allReady ? 'inherit' : 'text.secondary',
            opacity: allReady ? 0.75 : 1,
            ...oneLine,
          }}
        >
          {detail}
        </Box>
      </Box>
      {alert ? (
        <Box role="alert" sx={visuallyHidden}>
          {alert}
        </Box>
      ) : null}
      <Button
        variant="primary"
        size="sm"
        shape="pill"
        onClick={(event) => {
          event.stopPropagation();
          open();
        }}
      >
        {lead?.open
          ? t('review')
          : ready > 1
            ? t('openCount', { count: ready })
            : t('open')}
      </Button>
    </Box>,
    host,
  );
}
