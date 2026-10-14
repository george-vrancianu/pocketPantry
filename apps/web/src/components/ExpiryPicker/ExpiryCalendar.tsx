import { Box, tokens, usePrefersReducedMotion } from '@pocket-pantry/ui';
import {
  useCallback,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type Ref,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  daysUntil,
  defaultExpiryDate,
  fromIso,
  localIso,
  type IsoDate,
} from '../../lib/pantry';
import { calendarMonths, daysInMonth, monthKey } from './calendarMonths';
import { focusRing } from './focusRing';

export type ExpiryCalendarHandle = {
  /**
   * Scroll the list so the month of `iso` is at the top: smoothly when `smooth` (and motion is allowed),
   * instantly otherwise. For quick picks and the Today link.
   */
  scrollToMonth: (iso: string, smooth: boolean) => void;
};

export type ExpiryCalendarProps = {
  ref?: Ref<ExpiryCalendarHandle>;
  value: IsoDate | null;
  /** A day was tapped. */
  onChange: (iso: string) => void;
  today: Date;
  /** The Default Expiry in days, so the Usual date is always in the range; null when there is none. */
  usualDays: number | null;
  /** Days from today through today + this are the Expiring Soon band. */
  staleThresholdDays: number;
};

/** Days an arrow key moves by. */
const ARROW_STEP: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -7,
  ArrowDown: 7,
};

/**
 * The day a key moves focus to from `iso`, or null when it doesn't move: arrows stay within the month, and
 * Page Up/Down keep the day of the month, falling back to the last day of a shorter month.
 */
function keyTarget(iso: string, key: string): string | null {
  const day = fromIso(iso);
  const step = ARROW_STEP[key];
  if (step !== undefined) {
    const next = new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate() + step,
    );
    return next.getMonth() === day.getMonth() ? localIso(next) : null;
  }
  const months = key === 'PageDown' ? 1 : key === 'PageUp' ? -1 : 0;
  if (months === 0) return null;
  const target = new Date(day.getFullYear(), day.getMonth() + months, 1);
  const length = daysInMonth(target.getFullYear(), target.getMonth());
  return localIso(
    new Date(
      target.getFullYear(),
      target.getMonth(),
      Math.min(day.getDate(), length),
    ),
  );
}

/** A Monday, for the weekday initials. */
const MONDAY = new Date(2024, 0, 1);

/** Selected-day lift: the handoff's `--shadow-btn` in the accent; the app has no shadow token for it. */
const SELECTED_SHADOW = '0 4px 12px rgba(46,106,77,.28)';

/**
 * The calendar card of the expiry sheet: weekday initials (Monday first), a vertically scrolling list of whole
 * months with sticky names, and a legend for the Expiring Soon band. It opens on the value's month (today's when
 * empty) and keeps its place when a day is tapped.
 */
export function ExpiryCalendar({
  ref,
  value,
  onChange,
  today,
  usualDays,
  staleThresholdDays,
}: ExpiryCalendarProps) {
  const { t, i18n } = useTranslation('pantry');
  const reduceMotion = usePrefersReducedMotion();
  const legendId = useId();
  const headingId = useId();
  const scroller = useRef<HTMLDivElement>(null);
  const { color } = tokens;
  // The range is fixed while the sheet is open, so clearing a far value doesn't pull the list out from under it.
  const [months] = useState(() =>
    calendarMonths(
      today,
      value,
      usualDays === null ? null : defaultExpiryDate(usualDays, today),
    ),
  );

  const scrollToMonth = useCallback(
    (iso: string, smooth: boolean) => {
      const list = scroller.current;
      const month = list?.querySelector<HTMLElement>(
        `[data-month="${monthKey(iso)}"]`,
      );
      if (!list || !month) return;
      const top = month.offsetTop;
      if (typeof list.scrollTo === 'function')
        list.scrollTo({
          top,
          behavior: smooth && !reduceMotion ? 'smooth' : 'auto',
        });
      else list.scrollTop = top;
    },
    [reduceMotion],
  );

  useImperativeHandle(ref, () => ({ scrollToMonth }), [scrollToMonth]);

  // The calendar is a single Tab stop: the selected day when it is shown, otherwise today.
  const shown = (iso: string | null) =>
    iso !== null && months.some((month) => month.key === monthKey(iso));
  const tabStop = shown(value) ? value : localIso(today);

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const from = (event.target as HTMLElement).closest<HTMLElement>('.day')
      ?.dataset.iso;
    if (!from) return;
    const to = keyTarget(from, event.key);
    if (to === null) {
      // Page Up/Down would otherwise scroll the list away from the focused day.
      if (event.key === 'PageUp' || event.key === 'PageDown')
        event.preventDefault();
      return;
    }
    event.preventDefault();
    scroller.current
      ?.querySelector<HTMLElement>(`.day[data-iso="${to}"]`)
      ?.focus();
  };

  // Opens straight on the value's month; after that only an explicit request scrolls.
  useLayoutEffect(() => {
    scrollToMonth(value ?? localIso(today), false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const weekday = new Intl.DateTimeFormat(i18n.language, { weekday: 'narrow' });
  const monthName = new Intl.DateTimeFormat(i18n.language, {
    month: 'long',
    year: 'numeric',
  });
  const dayName = new Intl.DateTimeFormat(i18n.language, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const grid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '2px',
  } as const;
  const fade =
    'linear-gradient(to bottom, transparent, #000 14px, #000 calc(100% - 18px), transparent)';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: color.surface,
        border: `1px solid ${color.line}`,
        borderRadius: `${tokens.radius.card}px`,
      }}
    >
      <Box
        aria-hidden
        sx={{
          ...grid,
          p: '8px 8px 4px',
          borderBottom: `1px solid ${color.divider}`,
        }}
      >
        {Array.from({ length: 7 }, (_, index) => (
          <Box
            key={index}
            component="span"
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color: color.muted,
              textAlign: 'center',
              letterSpacing: '.04em',
            }}
          >
            {weekday.format(
              new Date(
                MONDAY.getFullYear(),
                MONDAY.getMonth(),
                MONDAY.getDate() + index,
              ),
            )}
          </Box>
        ))}
      </Box>
      <Box
        ref={scroller}
        role="group"
        aria-label={t('picker.calendar')}
        onKeyDown={onKeyDown}
        sx={{
          position: 'relative',
          height: 264,
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          scrollSnapType: 'y proximity',
          maskImage: fade,
          WebkitMaskImage: fade,
          '& .day': {
            justifySelf: 'center',
            width: 34,
            height: 34,
            p: 0,
            border: 0,
            borderRadius: '50%',
            position: 'relative',
            display: 'grid',
            placeItems: 'center',
            font: 'inherit',
            fontSize: 13.5,
            fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
            color: color.ink,
            backgroundColor: 'transparent',
            cursor: 'pointer',
            transition: 'background-color .1s',
            '&:hover': { backgroundColor: color.chipNeutral },
            ...focusRing,
            '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
          },
          '& .day[data-past]': { color: color.muted },
          '& .day[data-band]': {
            backgroundColor: `color-mix(in srgb, ${color.soonBg} 70%, transparent)`,
          },
          '& .day[aria-current="date"]::after': {
            content: '""',
            position: 'absolute',
            bottom: 3,
            left: '50%',
            width: 4,
            height: 4,
            ml: '-2px',
            borderRadius: '50%',
            backgroundColor: color.accent,
          },
          '& .day[aria-pressed="true"]': {
            backgroundColor: color.accent,
            color: color.surface,
            boxShadow: SELECTED_SHADOW,
          },
          '& .day[aria-pressed="true"]::after': {
            backgroundColor: color.surface,
          },
        }}
      >
        {months.map((month) => {
          const id = `${headingId}-${month.key}`;
          return (
            <Box
              key={month.key}
              data-month={month.key}
              sx={{ p: '0 8px 6px', scrollSnapAlign: 'start' }}
            >
              <Box
                component="h3"
                id={id}
                sx={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                  m: 0,
                  p: '8px 4px 4px',
                  backgroundColor: color.surface,
                  fontFamily: tokens.font.display,
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                {monthName.format(month.first)}
              </Box>
              <Box role="grid" aria-labelledby={id}>
                {month.weeks.map((week, row) => (
                  <Box key={row} role="row" sx={{ ...grid, mb: '2px' }}>
                    {week.map((iso, column) => {
                      if (iso === null)
                        return <span key={column} role="gridcell" />;
                      const days = daysUntil(iso, today);
                      const inBand = days >= 0 && days <= staleThresholdDays;
                      return (
                        <Box key={iso} role="gridcell" sx={{ display: 'grid' }}>
                          <button
                            type="button"
                            className="day"
                            data-iso={iso}
                            tabIndex={iso === tabStop ? 0 : -1}
                            aria-label={dayName.format(fromIso(iso))}
                            aria-pressed={iso === value}
                            aria-current={days === 0 ? 'date' : undefined}
                            aria-describedby={inBand ? legendId : undefined}
                            data-past={days < 0 ? '' : undefined}
                            data-band={inBand ? '' : undefined}
                            onClick={() => onChange(iso)}
                          >
                            {fromIso(iso).getDate()}
                          </button>
                        </Box>
                      );
                    })}
                  </Box>
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 36,
          p: '6px 10px',
          borderTop: `1px solid ${color.divider}`,
          fontSize: 12.5,
          color: color.muted,
        }}
      >
        <Box
          component="span"
          sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Box
            component="span"
            aria-hidden
            sx={{
              width: 10,
              height: 10,
              borderRadius: '3px',
              backgroundColor: color.soonBg,
            }}
          />
          <span id={legendId}>
            {t('picker.within', { count: staleThresholdDays })}
          </span>
        </Box>
        <Box
          component="button"
          type="button"
          onClick={() => scrollToMonth(localIso(today), true)}
          sx={{
            p: '4px 2px',
            border: 0,
            borderRadius: '6px',
            backgroundColor: 'transparent',
            font: 'inherit',
            fontSize: 13,
            fontWeight: 700,
            color: color.accent,
            cursor: 'pointer',
            ...focusRing,
          }}
        >
          {t('picker.today')}
        </Box>
      </Box>
    </Box>
  );
}
