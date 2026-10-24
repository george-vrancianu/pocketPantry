// PROTOTYPE, throwaway: three structurally different Voice Inbox indicators above the Dock.
//  A  Status strip: the status pill grown into one wide row of counts; tap opens a Sheet.
//  B  Mic badge: a small chip of state dots over the mic; tap unfolds a tray in place (no modal).
//  C  Card deck: every note is its own stacked card; the top one is actionable, tap fans the deck.
import {
  Box,
  Button,
  ChevronDownIcon,
  ChevronUpIcon,
  GatorImage,
  palette,
  radius,
  shadow,
  Sheet,
} from '@pocket-pantry/ui';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { pillBottom, VOICE_LAYER } from '../../../lib/voicePlacement';
import {
  counts,
  inbox,
  isOpenable,
  listName,
  summary,
  tapTarget,
  useInbox,
  type FakeNote,
} from './store';
import {
  NoteRow,
  oneLine,
  ReviewAllButton,
  StateDot,
  stateLabel,
} from './shared';

const floating = {
  position: 'fixed',
  left: 16,
  right: 16,
  bottom: pillBottom,
  mx: 'auto',
  maxWidth: 420,
  zIndex: VOICE_LAYER.card,
} as const;

function tap(notes: FakeNote[], openList: () => void) {
  const target = tapTarget(notes);
  if (target === 'list') openList();
  else inbox.open(target);
}

/* ---------------------------------- A ---------------------------------- */

export function VariantA() {
  const { notes } = useInbox();
  const [listOpen, setListOpen] = useState(false);
  if (!notes.length) return null;
  const c = counts(notes);
  const single = tapTarget(notes) !== 'list';
  return (
    <>
      {createPortal(
        <Box
          role="status"
          component="button"
          onClick={() => tap(notes, () => setListOpen(true))}
          sx={{
            ...floating,
            display: 'flex',
            alignItems: 'center',
            gap: '11px',
            p: '11px 12px 11px 14px',
            border: 0,
            font: 'inherit',
            textAlign: 'left',
            cursor: 'pointer',
            bgcolor: 'pp.cardBg',
            color: 'text.primary',
            borderRadius: radius.control,
            boxShadow: shadow.float,
            outline: c.failed
              ? `2px solid ${palette('warning-main')}`
              : undefined,
          }}
        >
          <GatorImage
            mood={c.reading ? 'thinking' : 'happy'}
            size={44}
            decorative
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ fontSize: 14, fontWeight: 600, ...oneLine }}>
              {notes.length === 1
                ? '1 Voice Note'
                : `${notes.length} Voice Notes`}
            </Box>
            <Box sx={{ fontSize: 12, color: 'text.secondary', ...oneLine }}>
              {summary(notes)}
            </Box>
          </Box>
          {c.ready ? (
            <Box
              sx={{
                px: 1.5,
                py: 0.75,
                borderRadius: 99,
                bgcolor: palette('pp-accent'),
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {single ? 'Review' : `Open (${c.ready})`}
            </Box>
          ) : null}
        </Box>,
        document.body,
      )}
      <Sheet
        open={listOpen}
        onClose={() => setListOpen(false)}
        label="Voice Inbox"
        size="content"
        header={
          <Box sx={{ px: 2.5, pt: 1.5, fontSize: 20, fontWeight: 700 }}>
            Voice Inbox
          </Box>
        }
        footer={
          <Box sx={{ p: 2 }} onClick={() => setListOpen(false)}>
            <ReviewAllButton notes={notes} full />
          </Box>
        }
      >
        <Box
          sx={{ px: 2.5 }}
          onClick={(e) => {
            // Opening a note closes the inbox list behind it.
            if (
              (e.target as HTMLElement)
                .closest('button')
                ?.textContent?.match(/Review|See/)
            )
              setListOpen(false);
          }}
        >
          {notes.map((n) => (
            <NoteRow key={n.id} note={n} />
          ))}
          {notes.length === 0 ? (
            <Box sx={{ py: 3, color: 'text.secondary' }}>All done.</Box>
          ) : null}
        </Box>
      </Sheet>
    </>
  );
}

/* ---------------------------------- B ---------------------------------- */

export function VariantB() {
  const { notes } = useInbox();
  const [tray, setTray] = useState(false);
  if (!notes.length) return null;
  const c = counts(notes);
  return createPortal(
    <Box
      sx={{
        ...floating,
        left: 0,
        right: 0,
        maxWidth: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        pointerEvents: 'none',
      }}
    >
      {tray ? (
        <Box
          sx={{
            pointerEvents: 'auto',
            width: 'calc(100% - 32px)',
            maxWidth: 380,
            bgcolor: 'pp.cardBg',
            borderRadius: radius.control,
            boxShadow: shadow.float,
            px: 1.75,
            py: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Box
              sx={{
                flex: 1,
                fontSize: 12,
                fontWeight: 700,
                color: 'text.secondary',
              }}
            >
              VOICE INBOX
            </Box>
            <ReviewAllButton notes={notes} />
          </Box>
          {notes.map((n) => (
            <NoteRow key={n.id} note={n} dense />
          ))}
        </Box>
      ) : null}
      <Box
        component="button"
        aria-expanded={tray}
        onClick={() =>
          tray ? setTray(false) : tap(notes, () => setTray(true))
        }
        sx={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          border: 0,
          font: 'inherit',
          cursor: 'pointer',
          px: 1.25,
          py: 0.75,
          borderRadius: 99,
          bgcolor: c.failed ? palette('warning-light') : 'pp.cardBg',
          boxShadow: shadow.float,
          color: 'text.primary',
        }}
      >
        {notes.map((n) => (
          <StateDot key={n.id} note={n} size={16} />
        ))}
        <Box sx={{ fontSize: 13, fontWeight: 600, ml: 0.5 }}>
          {c.ready
            ? `${c.ready} ready`
            : c.failed
              ? `${c.failed} failed`
              : 'Reading'}
        </Box>
        {tray ? <ChevronDownIcon size={14} /> : <ChevronUpIcon size={14} />}
      </Box>
    </Box>,
    document.body,
  );
}

/* ---------------------------------- C ---------------------------------- */

/** The most useful note first: failed, then ready, then reading; oldest first within each. */
const rank = (n: FakeNote) =>
  n.state === 'failed' ? 0 : isOpenable(n) ? 1 : n.state === 'reading' ? 2 : 3;

export function VariantC() {
  const { notes } = useInbox();
  const [fanned, setFanned] = useState(false);
  if (!notes.length) return null;
  const ordered = [...notes].sort((a, b) => rank(a) - rank(b) || a.id - b.id);
  const top = ordered[0];
  const behind = ordered.length - 1;
  const card = {
    bgcolor: 'pp.cardBg',
    color: 'text.primary',
    borderRadius: radius.control,
    boxShadow: shadow.float,
    p: '10px 12px',
  } as const;

  if (fanned) {
    return createPortal(
      <Box
        sx={{
          ...floating,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.75,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 0.5 }}>
          <Button
            size="sm"
            shape="pill"
            variant="secondary"
            onClick={() => setFanned(false)}
          >
            Stack
          </Button>
          <Box sx={{ flex: 1 }} />
          <ReviewAllButton notes={notes} />
        </Box>
        {ordered.map((n) => (
          <Box key={n.id} sx={card}>
            <NoteRow note={n} dense />
          </Box>
        ))}
      </Box>,
      document.body,
    );
  }

  return createPortal(
    <Box sx={{ ...floating, pt: `${Math.min(behind, 2) * 7}px` }}>
      {/* The cards behind, peeking out above the top one. */}
      {Array.from({ length: Math.min(behind, 2) }).map((_, i) => (
        <Box
          key={i}
          aria-hidden
          sx={{
            ...card,
            position: 'absolute',
            left: 10 * (i + 1),
            right: 10 * (i + 1),
            top: (1 - i) * 7,
            height: 40,
            opacity: 0.7 - i * 0.2,
          }}
        />
      ))}
      <Box
        sx={{
          ...card,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <StateDot note={top} size={26} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ fontSize: 14, fontWeight: 600, ...oneLine }}>
            {isOpenable(top) ? `“${top.transcript}”` : stateLabel(top)}
          </Box>
          <Box sx={{ fontSize: 12, color: 'text.secondary', ...oneLine }}>
            {listName(top.defaultTarget)} ·{' '}
            {isOpenable(top) ? stateLabel(top) : top.language}
          </Box>
        </Box>
        {top.state === 'failed' ? (
          <Button
            size="sm"
            shape="pill"
            variant="primary"
            onClick={() => inbox.retry(top.id)}
          >
            Retry
          </Button>
        ) : isOpenable(top) ? (
          <Button
            size="sm"
            shape="pill"
            variant="primary"
            onClick={() => inbox.open([top.id])}
          >
            {top.state === 'answers' ? 'See' : 'Review'}
          </Button>
        ) : null}
        {behind ? (
          <Box
            component="button"
            onClick={() => setFanned(true)}
            sx={{
              border: 0,
              font: 'inherit',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 700,
              px: 1,
              py: 0.5,
              borderRadius: 99,
              bgcolor: palette('pp-accentTint'),
              color: palette('pp-accentOnTint'),
            }}
          >
            +{behind}
          </Box>
        ) : null}
      </Box>
    </Box>,
    document.body,
  );
}

export const VARIANTS = [
  { key: 'A', name: 'Status strip + sheet', Component: VariantA },
  { key: 'B', name: 'Mic badge + tray', Component: VariantB },
  { key: 'C', name: 'Card deck', Component: VariantC },
];
