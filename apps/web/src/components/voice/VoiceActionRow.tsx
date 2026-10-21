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
  focusRing,
  radius,
  palette,
} from '@pocket-pantry/ui';
import { soonBorder } from './soonBorder';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { VoiceReviewAction } from '../../lib/voice';
import { voiceNote } from '../../lib/voiceNote';
import { ActionEditor } from './ActionEditor';
import {
  blockOf,
  displayName,
  kindOf,
  type VoiceActionKind,
} from './reviewModel';
import { useVoiceActionText } from './voiceActionText';

const TILE: Record<
  VoiceActionKind,
  { bg: string; fg: string; icon: ReactNode }
> = {
  check: {
    bg: palette('pp-accentTint'),
    fg: palette('pp-accentOnTint'),
    icon: <CheckIcon size={18} />,
  },
  addChecked: {
    bg: palette('pp-accentTint'),
    fg: palette('pp-accentOnTint'),
    icon: <CheckIcon size={18} />,
  },
  add: {
    bg: palette('success-light'),
    fg: palette('success-main'),
    icon: <PlusIcon size={18} />,
  },
  uncheck: {
    bg: palette('pp-chip'),
    fg: palette('text-primary'),
    icon: <MinusIcon size={18} />,
  },
  remove: {
    bg: palette('error-light'),
    fg: palette('error-main'),
    icon: <MinusIcon size={18} />,
  },
  removeAll: {
    bg: palette('error-light'),
    fg: palette('error-main'),
    icon: <MinusIcon size={18} />,
  },
  use: {
    bg: palette('error-light'),
    fg: palette('error-main'),
    icon: <MinusIcon size={18} />,
  },
  setQuantity: {
    bg: palette('pp-chip'),
    fg: palette('text-primary'),
    icon: <EqualIcon size={18} />,
  },
  runningLow: {
    bg: palette('secondary-main'),
    fg: palette('secondary-contrastText'),
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
        backgroundColor: open ? palette('pp-subtle') : 'transparent',
        outline: blocked ? `2px solid ${soonBorder}` : 'none',
        outlineOffset: '-2px',
        borderRadius: radius.control,
        '& + &': { borderTop: `1px solid ${palette('divider')}` },
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
          color: palette('text-primary'),
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
            borderRadius: radius.control,
            display: 'grid',
            placeItems: 'center',
            backgroundColor: tile.bg,
            color: tile.fg,
            boxShadow: blocked
              ? `0 0 0 2px ${palette('warning-main')}`
              : 'none',
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
            <Box
              component="span"
              sx={{ color: palette('text-secondary'), fontWeight: 600 }}
            >
              {verb(kind)}{' '}
            </Box>
            <Box component="b" sx={{ fontWeight: 700 }}>
              {name}
            </Box>
          </Box>
          <Box
            sx={{
              fontSize: 12.5,
              color: palette('text-secondary'),
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {lineTwo(action)}
          </Box>
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
