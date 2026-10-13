import { Box, ChevronRightIcon, PlusIcon, tokens } from '@pocket-pantry/ui';
import type { ReactNode } from 'react';

export type ResultRowProps = {
  id: string;
  /** Free-text rows show a plus in their tile instead of a letter. */
  free?: boolean;
  name: string;
  /** Part of `name` to highlight, matched case-insensitively (first match). */
  highlight?: string;
  meta: string;
  open: boolean;
  /** Keyboard-highlighted in the listbox. */
  active: boolean;
  onToggle: () => void;
  /** The amount field, shown under the row while it is open. */
  children?: ReactNode;
};

function Highlighted({ text, match }: { text: string; match?: string }) {
  const at = match ? text.toLowerCase().indexOf(match.toLowerCase()) : -1;
  if (!match || at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <Box
        component="span"
        sx={{ color: tokens.color.accent, fontWeight: 700 }}
      >
        {text.slice(at, at + match.length)}
      </Box>
      {text.slice(at + match.length)}
    </>
  );
}

/** One option of the result listbox, with its open amount field under it. */
export function ResultRow({
  id,
  free,
  name,
  highlight,
  meta,
  open,
  active,
  onToggle,
  children,
}: ResultRowProps) {
  const { color } = tokens;
  return (
    <Box
      role="presentation"
      sx={{
        backgroundColor: open ? color.subtle : 'transparent',
        '& + &': { borderTop: `1px solid ${color.divider}` },
        // The list does not clip (the unit popover must overflow it), so round the ends here.
        '&:first-of-type': { borderRadius: '19px 19px 0 0' },
        '&:last-of-type': { borderRadius: '0 0 19px 19px' },
        '&:first-of-type:last-of-type': { borderRadius: '19px' },
      }}
    >
      <Box
        id={id}
        role="option"
        aria-selected={open}
        // Keep focus in the search input so the tap still lands.
        onMouseDown={(event: { preventDefault: () => void }) =>
          event.preventDefault()
        }
        onClick={onToggle}
        sx={{
          minHeight: 58,
          p: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          cursor: 'pointer',
          outline: active ? `2px solid ${color.accent}` : 'none',
          outlineOffset: -2,
        }}
      >
        <Box
          aria-hidden
          sx={{
            flexShrink: 0,
            width: 38,
            height: 38,
            display: 'grid',
            placeItems: 'center',
            borderRadius: '12px',
            backgroundColor: color.chipNeutral,
            color: color.muted,
            fontFamily: 'var(--font-display)',
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          {free ? <PlusIcon size={18} /> : name.charAt(0).toUpperCase()}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ fontSize: 15, fontWeight: 600, overflowWrap: 'anywhere' }}>
            <Highlighted text={name} match={highlight} />
          </Box>
          <Box sx={{ fontSize: 13, fontWeight: 500, color: color.muted }}>
            {meta}
          </Box>
        </Box>
        <Box
          aria-hidden
          sx={{
            display: 'flex',
            color: color.muted,
            transform: open ? 'rotate(90deg)' : 'none',
            transition: 'transform 150ms',
            '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
          }}
        >
          <ChevronRightIcon size={18} />
        </Box>
      </Box>
      {open ? children : null}
    </Box>
  );
}
