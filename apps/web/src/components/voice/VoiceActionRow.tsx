import {
  BatteryLowIcon,
  Box,
  CheckIcon,
  ChevronDownIcon,
  CloseIcon,
  EqualIcon,
  IconButton,
  MinusIcon,
  PlusIcon,
  tokens,
  focusRing,
} from '@pocket-pantry/ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { VoiceReviewAction } from '../../lib/voice';
import { voiceNote } from '../../lib/voiceNoteStore';
import { ActionEditor } from './ActionEditor';
import {
  blockOf,
  displayName,
  kindOf,
  type VoiceActionKind,
} from './reviewModel';
import { useVoiceActionText } from './voiceActionText';

const { color } = tokens;

const TILE: Record<
  VoiceActionKind,
  { bg: string; fg: string; icon: ReactNode }
> = {
  check: {
    bg: color.accentTint,
    fg: color.accentOnTint,
    icon: <CheckIcon size={18} />,
  },
  addChecked: {
    bg: color.accentTint,
    fg: color.accentOnTint,
    icon: <CheckIcon size={18} />,
  },
  add: { bg: color.okBg, fg: color.okFg, icon: <PlusIcon size={18} /> },
  uncheck: {
    bg: color.chipNeutral,
    fg: color.ink,
    icon: <MinusIcon size={18} />,
  },
  remove: {
    bg: color.urgentBg,
    fg: color.urgentFg,
    icon: <MinusIcon size={18} />,
  },
  removeAll: {
    bg: color.urgentBg,
    fg: color.urgentFg,
    icon: <MinusIcon size={18} />,
  },
  use: {
    bg: color.urgentBg,
    fg: color.urgentFg,
    icon: <MinusIcon size={18} />,
  },
  setQuantity: {
    bg: color.chipNeutral,
    fg: color.ink,
    icon: <EqualIcon size={18} />,
  },
  runningLow: {
    bg: color.butter,
    fg: color.butterInk,
    icon: <BatteryLowIcon size={18} />,
  },
};

/**
 * One Voice Action in Review: a header button (op tile, verb and name, what it
 * will do) that opens its editor in place, and a Drop button beside it. A row
 * that holds Apply back is outlined amber.
 */
export function VoiceActionRow({
  action,
  open,
  typed,
  invalid,
  spokenExpiry,
  onToggle,
  onTyped,
}: {
  action: VoiceReviewAction;
  open: boolean;
  typed: string;
  invalid: boolean;
  spokenExpiry: string | null;
  onToggle: () => void;
  onTyped: (text: string) => void;
}) {
  const { t } = useTranslation('voice');
  const { verb, lineTwo } = useVoiceActionText();
  const kind = kindOf(action);
  const tile = TILE[kind];
  const name = displayName(action);
  const blocked = blockOf(action) !== null;

  return (
    <Box
      component="li"
      data-voice-row={action.id}
      sx={{
        position: 'relative',
        listStyle: 'none',
        backgroundColor: open ? color.subtle : 'transparent',
        outline: blocked ? `2px solid ${color.soonBorder}` : 'none',
        outlineOffset: '-2px',
        borderRadius: blocked ? '12px' : 0,
        '& + &': { borderTop: `1px solid ${color.divider}` },
      }}
    >
      <Box
        component="button"
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '11px',
          width: '100%',
          minHeight: 60,
          py: '9px',
          pl: '12px',
          pr: '52px',
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
            width: 34,
            height: 34,
            flexShrink: 0,
            borderRadius: '10px',
            display: 'grid',
            placeItems: 'center',
            backgroundColor: tile.bg,
            color: tile.fg,
            boxShadow: blocked ? `0 0 0 2px ${color.soonFg}` : 'none',
          }}
        >
          {tile.icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              fontSize: 15,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            <Box component="span" sx={{ color: color.muted, fontWeight: 600 }}>
              {verb(kind)}{' '}
            </Box>
            <Box component="b" sx={{ fontWeight: 700 }}>
              {name}
            </Box>
          </Box>
          <Box
            sx={{
              fontSize: 12.5,
              color: color.muted,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {lineTwo(action)}
          </Box>
        </Box>
        <ChevronDownIcon
          size={18}
          style={{
            flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 220ms',
          }}
        />
      </Box>
      <Box sx={{ position: 'absolute', right: 8, top: 12 }}>
        <IconButton
          label={t('review.edit.drop', { verb: verb(kind), name })}
          tone="plain"
          size={34}
          onClick={() => voiceNote.remove(action.id)}
        >
          <CloseIcon size={17} />
        </IconButton>
      </Box>
      {open ? (
        <ActionEditor
          action={action}
          typed={typed}
          invalid={invalid}
          spokenExpiry={spokenExpiry}
          onTyped={onTyped}
          onDone={onToggle}
        />
      ) : null}
    </Box>
  );
}
