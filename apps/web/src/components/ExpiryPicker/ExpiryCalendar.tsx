import { Box, tokens, usePrefersReducedMotion } from '@pocket-pantry/ui';
import {
  useCallback,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type Ref,
} from 'react';
import { useTranslation } from 'react-i18next';
import { daysUntil, fromIso, localIso } from '../../lib/pantry';
import { calendarMonths, monthKey } from './calendarMonths';

export type ExpiryCalendarHandle = {
  /**
   * Scroll the list so the month of `iso` is at the top: smoothly when `smooth` (and motion is allowed),
   * instantly otherwise. For quick picks and the Today link.
   */
  scrollToMonth: (iso: string, smooth: boolean) => void;
};

export type ExpiryCalendarProps = {
  ref?: Ref<ExpiryCalendarHandle>;
  /** `YYYY-MM-DD`, or null. */
  value: string | null;
  /** A day was tapped. */
  onChange: (iso: string) => void;
  today: Date;
  /** Days from today through today + this are the stale band. */
  staleThresholdDays: number;
};

/** A Monday, for the weekday initials. */
const MONDAY = new Date(2024, 0, 1);

/** Selected-day lift: the handoff's `--shadow-btn` in the accent; the app has no shadow token for it. */
const SELECTED_SHADOW = '0 4px 12px rgba(46,106,77,.28)';

/**
 * The calendar card of the expiry sheet: weekday initials (Monday first), a vertically scrolling list of whole
 * months with sticky names, and a legend for the stale band. It opens on the value's month (today's when empty)
 * and keeps its place when a day is tapped.
 */
export function ExpiryCalendar({
  ref,
  value,
  onChange,
  today,
  staleThresholdDays,
}: ExpiryCalendarProps) {
  const { t, i18n } = useTranslation('pantry');
  const reduceMotion = usePrefersReducedMotion();
  const legendId = useId();
  const headingId = useId();
  const scroller = useRef<HTMLDivElement>(null);
  const { color } = tokens;
  // The range is fixed while the sheet is open, so clearing a far value doesn't pull the list out from under it.
  const [months] = useState(() => calendarMonths(today, value));

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
            '&:focus-visible': {
              outline: `2px solid ${color.accent}`,
              outlineOffset: 1,
            },
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
      </Box>
    </Box>
  );
}
