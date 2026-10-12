import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { useRef, type KeyboardEvent } from 'react';
import { tokens } from '../theme/tokens';

export type SegmentedTab<T extends string> = {
  value: T;
  label: string;
  /** A small urgent badge inside the tab, e.g. "2 to buy". */
  badge?: string;
};

export type SegmentedTabsProps<T extends string> = {
  /** Accessible name of the tab list. */
  label: string;
  /** Prefix for the tab and panel ids; use a unique one per tab set (e.g. from `useId`). */
  id: string;
  tabs: SegmentedTab<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** The id of a tab's button; give the panel `aria-labelledby` of it. */
export const segmentedTabId = (id: string, value: string) =>
  `${id}-tab-${value}`;

/** The id of a tab's panel; the selected tab points at it with `aria-controls` (only that panel is rendered). */
export const segmentedTabPanelId = (id: string, value: string) =>
  `${id}-panel-${value}`;

/** Equal-width tabs in a segmented-control track. Arrow keys move and select, wrapping round. */
export function SegmentedTabs<T extends string>({
  label,
  id,
  tabs,
  value,
  onChange,
}: SegmentedTabsProps<T>) {
  const { color } = tokens;
  const buttons = useRef(new Map<string, HTMLElement>());

  const select = (index: number) => {
    const target = tabs[(index + tabs.length) % tabs.length]!;
    onChange(target.value);
    buttons.current.get(target.value)?.focus();
  };
  const onKeyDown = (event: KeyboardEvent, index: number) => {
    const moves: Record<string, number | undefined> = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: tabs.length - 1,
    };
    const next = moves[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select(next);
  };

  return (
    <Box
      role="tablist"
      aria-label={label}
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${tabs.length}, 1fr)`,
        gap: '4px',
        p: '4px',
        backgroundColor: color.chipNeutral,
        borderRadius: '16px',
      }}
    >
      {tabs.map((tab, index) => {
        const selected = tab.value === value;
        return (
          <ButtonBase
            key={tab.value}
            ref={(node: HTMLElement | null) => {
              if (node) buttons.current.set(tab.value, node);
              else buttons.current.delete(tab.value);
            }}
            role="tab"
            id={segmentedTabId(id, tab.value)}
            aria-selected={selected}
            aria-controls={
              selected ? segmentedTabPanelId(id, tab.value) : undefined
            }
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
            sx={{
              height: 40,
              gap: '6px',
              borderRadius: '12px',
              fontSize: 14,
              fontWeight: selected ? 700 : 600,
              fontFamily: tokens.font.body,
              backgroundColor: selected ? color.surface : 'transparent',
              color: selected ? color.ink : color.muted,
              boxShadow: selected ? '0 1px 2px rgba(23,35,28,.08)' : 'none',
              '&:focus-visible': {
                outline: `3px solid ${color.accent}`,
                outlineOffset: 2,
              },
            }}
          >
            {tab.label}
            {tab.badge ? ' ' : null}
            {tab.badge ? (
              <Box
                component="span"
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  px: '6px',
                  py: '2px',
                  borderRadius: `${tokens.radius.chip}px`,
                  backgroundColor: color.urgentBg,
                  color: color.urgentFg,
                }}
              >
                {tab.badge}
              </Box>
            ) : null}
          </ButtonBase>
        );
      })}
    </Box>
  );
}
