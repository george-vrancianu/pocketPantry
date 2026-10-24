// PROTOTYPE, throwaway: pieces every variant reuses (a note row, the stub Review, state glyphs).
import {
  Box,
  Button,
  CheckIcon,
  GatorImage,
  palette,
  Sheet,
  WifiOffIcon,
} from '@pocket-pantry/ui';
import { inbox, isMergeable, listName, useInbox, type FakeNote } from './store';

export const oneLine = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;

const spin = {
  '@keyframes ppProtoSpin': { to: { transform: 'rotate(360deg)' } },
  animation: 'ppProtoSpin 0.9s linear infinite',
};

/** A small round glyph for a note's state. */
export function StateDot({
  note,
  size = 22,
}: {
  note: FakeNote;
  size?: number;
}) {
  const base = {
    width: size,
    height: size,
    flex: 'none',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as const;
  if (note.state === 'reading' || note.state === 'waiting') {
    return (
      <Box
        aria-label={note.state === 'waiting' ? 'Waiting' : 'Reading'}
        sx={{
          ...base,
          border: '2.5px solid',
          borderColor: palette('pp-accentTint'),
          borderTopColor:
            note.state === 'reading' ? palette('pp-accent') : undefined,
          ...(note.state === 'reading' ? spin : { opacity: 0.6 }),
        }}
      />
    );
  }
  if (note.state === 'failed') {
    return (
      <Box
        aria-label="Failed"
        sx={{
          ...base,
          bgcolor: palette('warning-light'),
          color: palette('warning-main'),
        }}
      >
        <WifiOffIcon size={size * 0.6} />
      </Box>
    );
  }
  return (
    <Box
      aria-label="Ready"
      sx={{ ...base, bgcolor: palette('pp-accent'), color: '#fff' }}
    >
      <CheckIcon size={size * 0.6} />
    </Box>
  );
}

export const stateLabel = (n: FakeNote) =>
  n.state === 'reading'
    ? 'Reading…'
    : n.state === 'waiting'
      ? 'Waiting to be read'
      : n.state === 'failed'
        ? (n.failure ?? 'Failed')
        : n.state === 'answers'
          ? `${n.answers.length} answers`
          : `${n.actions.length} changes to review`;

/** One note in a list: glyph, transcript preview, list and state, its own buttons. */
export function NoteRow({
  note,
  dense = false,
}: {
  note: FakeNote;
  dense?: boolean;
}) {
  const read = note.state === 'ready' || note.state === 'answers';
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        py: dense ? '6px' : '10px',
      }}
    >
      <StateDot note={note} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ fontSize: 14, fontWeight: 600, ...oneLine }}>
          {read
            ? `“${note.transcript}”`
            : `Voice Note · 0:0${note.durationS % 10}`}
        </Box>
        <Box sx={{ fontSize: 12, color: 'text.secondary', ...oneLine }}>
          {listName(note.defaultTarget)} · {note.language} · {stateLabel(note)}
        </Box>
      </Box>
      {note.state === 'failed' ? (
        <>
          <Button
            size="sm"
            shape="pill"
            variant="secondary"
            onClick={() => inbox.discard(note.id)}
          >
            Discard
          </Button>
          <Button
            size="sm"
            shape="pill"
            variant="primary"
            onClick={() => inbox.retry(note.id)}
          >
            Retry
          </Button>
        </>
      ) : read ? (
        <Button
          size="sm"
          shape="pill"
          variant="primary"
          onClick={() => inbox.open([note.id])}
        >
          {note.state === 'answers' ? 'See' : 'Review'}
        </Button>
      ) : null}
    </Box>
  );
}

/** "Review all (N)": merges every read note with Voice Actions. Null with fewer than two. */
export function ReviewAllButton({
  notes,
  full = false,
}: {
  notes: FakeNote[];
  full?: boolean;
}) {
  const mergeable = notes.filter(isMergeable);
  if (mergeable.length < 2) return null;
  return (
    <Button
      variant="primary"
      shape="pill"
      size="sm"
      fullWidth={full}
      onClick={() => inbox.open(mergeable.map((n) => n.id))}
    >
      Review all ({mergeable.length})
    </Button>
  );
}

/**
 * Stand-in for the existing Review and answer sheet, which this design leaves unchanged. Shows
 * only what merging adds: one "What I heard" with every transcript, actions grouped by list.
 */
export function ReviewStub() {
  const { notes, opened } = useInbox();
  const open = (opened ?? [])
    .map((id) => notes.find((n) => n.id === id))
    .filter((n): n is FakeNote => !!n);
  const answersOnly = open.length === 1 && open[0].state === 'answers';
  const merged = open.length > 1;
  const groups = ['Pick a list', 'Shopping List', 'Pantry'] as const;
  return (
    <Sheet
      open={open.length > 0}
      onClose={inbox.close}
      label="Review"
      header={
        <Box sx={{ px: 2.5, pt: 1.5, pb: 1 }}>
          <Box
            sx={{ fontSize: 11, color: 'text.secondary', letterSpacing: 0.5 }}
          >
            PROTOTYPE STUB · the real {answersOnly ? 'answer sheet' : 'Review'}{' '}
            opens here
          </Box>
          <Box sx={{ fontSize: 20, fontWeight: 700 }}>
            {answersOnly
              ? 'Your answers'
              : merged
                ? `Review ${open.length} Voice Notes`
                : 'Review your Voice Note'}
          </Box>
        </Box>
      }
      footer={
        <Box sx={{ display: 'flex', gap: 1, p: 2 }}>
          {answersOnly ? (
            <Button fullWidth variant="primary" onClick={inbox.finish}>
              Done
            </Button>
          ) : (
            <>
              <Button fullWidth variant="secondary" onClick={inbox.finish}>
                Discard{merged ? ' all' : ''}
              </Button>
              <Button fullWidth variant="primary" onClick={inbox.finish}>
                Apply {open.reduce((s, n) => s + n.actions.length, 0)}
              </Button>
            </>
          )}
        </Box>
      }
    >
      <Box sx={{ px: 2.5, pb: 2 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: palette('pp-accentTint'),
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <GatorImage mood="happy" size={28} decorative />
            <Box sx={{ fontWeight: 600, fontSize: 13 }}>What I heard</Box>
          </Box>
          {open.map((n, i) => (
            <Box key={n.id} sx={{ fontSize: 13, mt: 0.5 }}>
              {merged ? <b>{i + 1}. </b> : null}“{n.transcript}”
              <Box component="span" sx={{ color: 'text.secondary' }}>
                {' '}
                · {listName(n.defaultTarget)}
              </Box>
            </Box>
          ))}
        </Box>
        {open.some((n) => n.answers.length) ? (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ fontWeight: 700, mb: 0.5 }}>Answers</Box>
            {open
              .flatMap((n) => n.answers)
              .map((a) => (
                <Box key={a} sx={{ fontSize: 14, py: 0.5 }}>
                  {a}
                </Box>
              ))}
          </Box>
        ) : null}
        {groups.map((g) => {
          const rows = open.flatMap((n) =>
            n.actions
              .filter((a) => a.list === g)
              .map((a) => ({ ...a, note: n.id })),
          );
          if (!rows.length) return null;
          return (
            <Box key={g} sx={{ mb: 2 }}>
              <Box sx={{ fontWeight: 700, mb: 0.5 }}>{g}</Box>
              {rows.map((a, i) => (
                <Box
                  key={i}
                  sx={{
                    fontSize: 14,
                    py: 0.75,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{a.text}</span>
                  {merged ? (
                    <Box
                      component="span"
                      sx={{ color: 'text.secondary', fontSize: 12 }}
                    >
                      note {open.findIndex((n) => n.id === a.note) + 1}
                    </Box>
                  ) : null}
                </Box>
              ))}
            </Box>
          );
        })}
      </Box>
    </Sheet>
  );
}
