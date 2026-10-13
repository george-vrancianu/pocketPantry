import { useEffect, useId, useImperativeHandle, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent, ReactNode, Ref } from 'react';
import { Box } from '../atoms/Layout';
import { DeleteIcon } from '../atoms/icons';
import { tokens } from '../theme/tokens';
import { usePrefersReducedMotion } from '../theme/usePrefersReducedMotion';
import { listRowItemSx } from './ListRow';
import {
  HOLD_MS,
  PRESS_MS,
  REVEAL_PT,
  useRowGestures,
  vibrate,
} from './useRowGestures';
import { visuallyHidden } from '../theme/visuallyHidden';

/** The confirmation counts down this long, then the row returns to idle. */
const CONFIRM_MS = 6000;
const FLY_OFF_MS = 200;
const COLLAPSE_MS = 240;
const SLIDE_MS = 260;
const HAPTIC_COLLAPSE = 8;
const HAPTIC_REMOVE = 10;
const INTERACTIVE = 'button, a, input, select, textarea, [role="button"]';

export type SwipeRowLabels = {
  /** The confirmation question, e.g. "Remove Tomato?". */
  question: string;
  /** Under the question, e.g. "from your list". */
  context: string;
  keep: string;
  remove: string;
  /** Shown on the band once the swipe passes the delete line. */
  releaseToDelete: string;
  /** Read out on a `pressed` row, e.g. "Ticked". */
  pressed?: string;
  /** The row's description for assistive technology, e.g. "Swipe left to remove, hold to edit". */
  hint?: string;
};

/** What a parent can ask of a row through its `ref`. */
export type SwipeRowHandle = {
  /** Open the inline "Remove {name}?" confirmation, as the swipe or Delete key does. */
  askToRemove: () => void;
};

export type SwipeRowProps = {
  /** Names the row for assistive technology. */
  name: string;
  labels: SwipeRowLabels;
  /** Called after the row has collapsed; the list decides what removing means. */
  onRemove: () => void;
  /** Enter on the focused row, and holding the row for 500 ms. */
  onEdit?: () => void;
  ref?: Ref<SwipeRowHandle>;
  /** A tap on the row (not on a button inside it), and Space on the focused row. */
  onTap?: () => void;
  /** Marks a row that toggles as on: announced through `labels.pressed` (aria-pressed is not valid on a group). */
  pressed?: boolean;
  /** Ignore gestures and keys, e.g. while a save is in flight. */
  disabled?: boolean;
  /** The row's content, in practice a `ListRow`. */
  children: ReactNode;
};

type Phase = 'idle' | 'confirming' | 'removing';

/** Only one row confirms at a time: opening one closes the one that was open. */
let closeOpenConfirmation: (() => void) | null = null;

const dimOf = (zone: number) => (zone === 2 ? 0.45 : zone === 1 ? 0.7 : 1);

/**
 * A list row you swipe left to remove. It owns the `<li>`: a single tab stop (a group named after the
 * item) that acts on Enter, Space and Delete/Backspace. The swipe lands in one of three zones
 * (see `useRowGestures`): spring back, an inline confirmation, or fly off and collapse.
 * It knows nothing about Undo: `onRemove` runs after the collapse.
 */
export function SwipeRow({
  name,
  labels,
  ref,
  onRemove,
  onEdit,
  onTap,
  pressed,
  disabled = false,
  children,
}: SwipeRowProps) {
  const reduceMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState<Phase>('idle');
  const [flew, setFlew] = useState(false);
  const [collapsing, setCollapsing] = useState(false);
  const [height, setHeight] = useState(0);
  const itemRef = useRef<HTMLLIElement>(null);
  const keepRef = useRef<HTMLButtonElement>(null);
  // A stable identity, so the module-level slot can tell which row holds it.
  const closer = useRef(() =>
    setPhase((current) => (current === 'confirming' ? 'idle' : current)),
  ).current;
  const onRemoveRef = useRef(onRemove);
  onRemoveRef.current = onRemove;
  const removing = useRef(false);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const idle = phase === 'idle' && !disabled;

  /** Focus would fall to <body> when the row goes: hand it to the next row, else the previous, else the list. */
  const moveFocusAway = () => {
    const item = itemRef.current;
    if (!item?.contains(document.activeElement)) return;
    const sibling = (
      from: Element | null,
      step: 'nextElementSibling' | 'previousElementSibling',
    ) => {
      for (let el = from; el; el = el[step]) {
        if (el instanceof HTMLElement && el.matches('[tabindex]')) return el;
      }
      return null;
    };
    const target =
      sibling(item.nextElementSibling, 'nextElementSibling') ??
      sibling(item.previousElementSibling, 'previousElementSibling') ??
      item.parentElement;
    if (target && !target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1');
    }
    target?.focus();
  };

  const startRemoval = (fromSwipe: boolean) => {
    if (removing.current) return;
    removing.current = true;
    // Before the confirmation goes inert, which would blur the focused Remove button.
    moveFocusAway();
    if (closeOpenConfirmation === closer) closeOpenConfirmation = null;
    setPhase('removing');
    setFlew(fromSwipe);
    const finish = () => onRemoveRef.current();
    if (reduceMotion) {
      finish();
      return;
    }
    const later = (fn: () => void, ms: number) =>
      timers.current.push(setTimeout(fn, ms));
    const collapse = () => {
      vibrate(HAPTIC_COLLAPSE);
      setHeight(itemRef.current?.offsetHeight ?? 0);
      setCollapsing(true);
      later(finish, COLLAPSE_MS);
    };
    if (fromSwipe) later(collapse, FLY_OFF_MS);
    else collapse();
  };

  const gestures = useRowGestures({
    disabled: !idle,
    onAsk: () => openConfirmation(),
    onHold: onEdit,
    // A swipe past the delete line flies the row off and calls `onRemove`. If the parent then keeps the
    // row (it does not remove it), the row stays flown off and inert: the parent owns what removing means.
    onDelete: () => startRemoval(true),
  });

  function openConfirmation() {
    if (closeOpenConfirmation && closeOpenConfirmation !== closer) {
      closeOpenConfirmation();
    }
    closeOpenConfirmation = closer;
    setPhase('confirming');
  }

  const keep = () => {
    if (closeOpenConfirmation === closer) closeOpenConfirmation = null;
    setPhase('idle');
    itemRef.current?.focus();
  };

  useImperativeHandle(ref, () => ({
    askToRemove: () => {
      if (idle) openConfirmation();
    },
  }));

  const confirming = phase === 'confirming';
  const hintId = useId();
  useEffect(() => {
    if (!confirming) return;
    keepRef.current?.focus();
    const timer = setTimeout(() => {
      if (closeOpenConfirmation === closer) closeOpenConfirmation = null;
      setPhase('idle');
      const item = itemRef.current;
      if (item?.contains(document.activeElement)) item.focus();
    }, CONFIRM_MS);
    return () => clearTimeout(timer);
  }, [confirming, closer]);

  // A row that leaves frees the slot, and does not call `onRemove` after it is gone.
  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending) clearTimeout(timer);
      pending.length = 0;
      removing.current = false;
      if (closeOpenConfirmation === closer) closeOpenConfirmation = null;
    };
  }, [closer]);

  const onKeyDown = (event: KeyboardEvent<HTMLLIElement>) => {
    if (event.target !== event.currentTarget || !idle) return;
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      openConfirmation();
    } else if (event.key === 'Enter' && onEdit) {
      event.preventDefault();
      onEdit();
    } else if (event.key === ' ' && onTap) {
      event.preventDefault();
      onTap();
    }
  };

  const onContentClick = (event: MouseEvent<HTMLElement>) => {
    if (!onTap || !idle) return;
    const target = event.target as Element;
    if (target.closest(INTERACTIVE)) return;
    onTap();
  };

  const { x, zone, dragging, pressing, armed, origin } = gestures;
  const flying = phase === 'removing' && flew;
  const solid = zone === 2 || flying;
  const progress = Math.min(1, -x / REVEAL_PT);
  const slide = reduceMotion ? 'none' : undefined;
  const motion = (value: string) => slide ?? value;

  return (
    <Box
      component="li"
      ref={itemRef}
      role="group"
      aria-label={name}
      aria-describedby={labels.hint ? hintId : undefined}
      aria-keyshortcuts={onEdit ? 'Enter Delete Backspace' : 'Delete Backspace'}
      tabIndex={0}
      onKeyDown={onKeyDown}
      sx={{
        ...listRowItemSx,
        overflow: 'hidden',
        userSelect: 'none',
        WebkitTouchCallout: 'none',
        touchAction: 'pan-y',
        outline: 'none',
        '&:focus-visible': {
          outline: `2px solid ${tokens.color.accent}`,
          outlineOffset: -2,
        },
        ...(collapsing
          ? {
              '--row-height': `${height}px`,
              animation: `pp-row-collapse ${COLLAPSE_MS}ms cubic-bezier(.4,0,.6,1) forwards`,
              '@keyframes pp-row-collapse': {
                from: { maxHeight: 'var(--row-height)', opacity: 1 },
                to: { maxHeight: 0, opacity: 0 },
              },
            }
          : {}),
      }}
    >
      {pressed && labels.pressed ? (
        <Box component="span" sx={visuallyHidden}>
          {labels.pressed}
        </Box>
      ) : null}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          inset: 0,
          bgcolor: solid ? tokens.color.urgentFg : tokens.color.urgentBg,
          opacity: solid ? 1 : x < 0 ? 0.35 + 0.65 * progress : 0,
          transition: motion('background-color 180ms, opacity 120ms'),
        }}
      />
      <Box
        {...gestures.bind}
        data-swipe-row-content=""
        onClick={onContentClick}
        inert={confirming || undefined}
        sx={{
          position: 'relative',
          // The row's inline padding; lists put nothing around the content.
          pl: '12px',
          pr: '10px',
          bgcolor: tokens.color.surface,
          cursor: onTap ? 'pointer' : undefined,
          transform: flying
            ? `translateX(calc(-100% - ${REVEAL_PT}px))`
            : confirming
              ? 'translateX(-30%)'
              : `translateX(${x}px)${pressing && !armed && !reduceMotion ? ' scale(.99)' : ''}`,
          opacity: confirming ? 0 : 1,
          transition: dragging
            ? 'none'
            : motion(
                flying
                  ? `transform ${FLY_OFF_MS}ms cubic-bezier(.4,0,.8,.6)`
                  : confirming
                    ? `transform ${SLIDE_MS}ms cubic-bezier(.2,.8,.2,1), opacity 200ms`
                    : pressing
                      ? 'transform 250ms ease-out, opacity 200ms'
                      : armed
                        ? 'transform 400ms ease-out, opacity 200ms'
                        : 'transform 300ms cubic-bezier(.25,1.35,.45,1), opacity 200ms',
              ),
          // Flying off leaves the band solid, so the content itself stays opaque.
          ...(flying ? { bgcolor: tokens.color.surface } : {}),
        }}
      >
        {pressing && origin && !reduceMotion ? (
          <HoldCircle origin={origin} armed={armed} />
        ) : null}
        <Box
          sx={{
            position: 'relative',
            opacity: pressing && reduceMotion ? 0.7 : dimOf(zone),
            transition: motion('opacity 150ms'),
          }}
        >
          {children}
        </Box>
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            left: '100%',
            top: 0,
            bottom: 0,
            width: REVEAL_PT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: solid ? tokens.color.surface : tokens.color.urgentFg,
            opacity: dragging ? 0.3 + 0.7 * progress : 1,
            transform: `scale(${dragging ? 0.86 + 0.14 * progress : 1})`,
            transition: dragging ? 'none' : motion('opacity 150ms'),
          }}
        >
          <Box
            sx={{
              display: 'flex',
              transform: `scale(${solid ? 1.28 : zone === 1 ? 1.12 : 1})`,
              transition: motion('transform 300ms cubic-bezier(.2,.7,.3,1)'),
            }}
          >
            <DeleteIcon size={22} />
          </Box>
        </Box>
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            top: '50%',
            left: `calc(100% + ${REVEAL_PT + 4}px)`,
            whiteSpace: 'nowrap',
            fontSize: 12.5,
            fontWeight: 700,
            color: tokens.color.surface,
            opacity: solid ? 1 : 0,
            transform: `translateY(-50%) translateX(${solid ? 0 : 6}px)`,
            transition: motion('opacity 150ms, transform 180ms'),
          }}
        >
          {labels.releaseToDelete}
        </Box>
      </Box>
      {confirming || (phase === 'removing' && !flew) ? (
        <Box
          role="group"
          aria-label={labels.question}
          inert={phase === 'removing' || undefined}
          onKeyDown={(event: KeyboardEvent) => {
            if (event.key !== 'Escape') return;
            event.stopPropagation();
            keep();
          }}
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            p: '8px 10px 8px 14px',
            bgcolor: tokens.color.urgentBg,
            pointerEvents: phase === 'removing' ? 'none' : undefined,
            animation: reduceMotion
              ? 'none'
              : `pp-row-confirm-in ${SLIDE_MS}ms cubic-bezier(.2,.8,.2,1)`,
            '@keyframes pp-row-confirm-in': {
              from: { transform: 'translateX(100%)' },
              to: { transform: 'translateX(0)' },
            },
          }}
        >
          <Box
            aria-hidden="true"
            sx={{
              flexShrink: 0,
              width: 30,
              height: 30,
              borderRadius: '50%',
              bgcolor: tokens.color.urgentFg,
              color: tokens.color.surface,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <DeleteIcon size={16} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: tokens.color.ink,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {labels.question}
            </Box>
            <Box sx={{ fontSize: 12, color: tokens.color.urgentFg }}>
              {labels.context}
            </Box>
          </Box>
          <ConfirmButton ref={keepRef} onClick={keep}>
            {labels.keep}
          </ConfirmButton>
          <ConfirmButton
            danger
            onClick={() => {
              vibrate(HAPTIC_REMOVE);
              startRemoval(false);
            }}
          >
            {labels.remove}
          </ConfirmButton>
          {phase === 'confirming' ? (
            <Box
              aria-hidden="true"
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: 3,
                bgcolor: tokens.color.urgentFg,
                opacity: 0.55,
                transformOrigin: 'left',
                animation: reduceMotion
                  ? 'none'
                  : `pp-row-countdown ${CONFIRM_MS}ms linear forwards`,
                '@keyframes pp-row-countdown': {
                  from: { transform: 'scaleX(1)' },
                  to: { transform: 'scaleX(0)' },
                },
              }}
            />
          ) : null}
        </Box>
      ) : null}
      {labels.hint ? (
        <Box component="span" id={hintId} hidden>
          {labels.hint}
        </Box>
      ) : null}
    </Box>
  );
}

const HOLD_CIRCLE_PT = 48;

/**
 * The hold circle (handoff section 5): grows from the touch point over the rest of the hold, under the
 * content, clipped by the row. It breathes once while it grows, one ring drifts out with it, and a last
 * ring leaves when the row arms. It mounts 90 ms into the hold, so its animation is shorter by that much.
 */
function HoldCircle({
  origin,
  armed,
}: {
  origin: { x: number; y: number };
  armed: boolean;
}) {
  const growMs = HOLD_MS - PRESS_MS;
  const centre = {
    position: 'absolute',
    left: origin.x - HOLD_CIRCLE_PT / 2,
    top: origin.y - HOLD_CIRCLE_PT / 2,
    width: HOLD_CIRCLE_PT,
    height: HOLD_CIRCLE_PT,
    borderRadius: '50%',
    pointerEvents: 'none',
  } as const;
  const halo = `color-mix(in srgb, ${tokens.color.accent} 22%, transparent)`;
  return (
    <Box aria-hidden="true" data-hold-circle="">
      <Box
        sx={{
          ...centre,
          bgcolor: tokens.color.accentTint,
          opacity: 0.55,
          transform: 'scale(20)',
          animation: armed
            ? 'pp-hold-fade 450ms 100ms ease-out forwards'
            : `pp-hold-grow ${growMs}ms cubic-bezier(.3,.05,.3,1) forwards, pp-hold-breathe ${growMs}ms ease-in-out`,
          '@keyframes pp-hold-grow': {
            from: { transform: 'scale(0)' },
            to: { transform: 'scale(20)' },
          },
          '@keyframes pp-hold-breathe': {
            '0%': { boxShadow: '0 0 0 0 transparent' },
            '50%': { boxShadow: `0 0 18px 6px ${halo}` },
            '100%': { boxShadow: '0 0 0 0 transparent' },
          },
          '@keyframes pp-hold-fade': {
            from: { opacity: 0.55 },
            to: { opacity: 0 },
          },
        }}
      />
      <Box
        sx={{
          ...centre,
          border: `1.5px solid ${tokens.color.accent}`,
          boxSizing: 'border-box',
          opacity: 0,
          animation: `pp-hold-ring ${growMs}ms linear`,
          '@keyframes pp-hold-ring': {
            '0%': { opacity: 0, transform: 'scale(.9)' },
            '25%': { opacity: 0.35 },
            '100%': { opacity: 0, transform: 'scale(2.6)' },
          },
        }}
      />
      {armed ? (
        <Box
          sx={{
            ...centre,
            border: `1.5px solid ${tokens.color.accent}`,
            boxSizing: 'border-box',
            opacity: 0,
            animation: 'pp-hold-armed-ring 500ms ease-out',
            '@keyframes pp-hold-armed-ring': {
              from: { opacity: 0.4, transform: 'scale(1.2)' },
              to: { opacity: 0, transform: 'scale(4)' },
            },
          }}
        />
      ) : null}
    </Box>
  );
}

function ConfirmButton({
  danger = false,
  ref,
  onClick,
  children,
}: {
  danger?: boolean;
  ref?: Ref<HTMLButtonElement>;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Box
      component="button"
      type="button"
      ref={ref}
      onClick={onClick}
      sx={{
        flexShrink: 0,
        height: 34,
        px: '14px',
        borderRadius: '10px',
        font: 'inherit',
        fontSize: 13.5,
        fontWeight: 700,
        cursor: 'pointer',
        border: danger ? 0 : `1px solid ${tokens.color.line}`,
        bgcolor: danger ? tokens.color.urgentFg : tokens.color.surface,
        color: danger ? tokens.color.surface : tokens.color.ink,
        '&:active': { transform: 'scale(.96)' },
      }}
    >
      {children}
    </Box>
  );
}
