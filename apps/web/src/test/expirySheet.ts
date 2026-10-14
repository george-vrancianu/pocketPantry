import { within } from '@testing-library/react';

/*
 * Queries into the open expiry sheet that stay clear of its calendar.
 *
 * The calendar renders 14 to 20 months of day buttons, over 400 of them. A role query with a `name` (or an unnamed
 * `getAllByRole('button')`) across the whole sheet computes the accessible name or visibility of every one, and in
 * jsdom each needs a cold `getComputedStyle` against the app's few hundred Emotion rules after every render: over a
 * second per query on an idle machine. Polled inside `waitFor`, those queries also starve the event loop, so the
 * sheet's own transitions and focus moves land late. These helpers narrow the search to the part of the sheet that
 * holds the button first.
 */

/** A quick-pick tile, looked up within the Quick picks group. */
export function quickPick(sheet: HTMLElement, name: string | RegExp) {
  return within(
    within(sheet).getByRole('group', { name: 'Quick picks' }),
  ).getByRole('button', { name });
}

/** The quick-pick tiles, in order. */
export function quickPickTiles(sheet: HTMLElement) {
  return within(
    within(sheet).getByRole('group', { name: 'Quick picks' }),
  ).getAllByRole('button');
}

/** English day labels, e.g. "Friday, November 20, 2026", name their month's grid "November 2026". */
const EN_DAY = /^\w+, (\w+) \d{1,2}, (\d{4})$/;

/**
 * A calendar day by its full label, looked up within its month's grid. The month is read from an English label;
 * pass it (the grid's name, e.g. "noiembrie 2026") for any other locale.
 */
export function calendarDay(sheet: HTMLElement, label: string, month?: string) {
  const parts = EN_DAY.exec(label);
  const gridName = month ?? (parts ? `${parts[1]} ${parts[2]}` : undefined);
  if (gridName === undefined)
    throw new Error(
      `Pass the month of "${label}": it isn't an English day label`,
    );
  return within(within(sheet).getByRole('grid', { name: gridName })).getByRole(
    'button',
    { name: label },
  );
}

/**
 * A button outside the calendar's days by its visible text: "Done", "No expiry" in the footer, "Today" under the
 * calendar. Matching text skips the per-button style lookups a role query would make for every day.
 */
export function sheetButton(sheet: HTMLElement, text: string) {
  return within(sheet).getByText(text, { selector: 'button' });
}

/** The calendar's day buttons, without a role query over every one. */
export function calendarDays(sheet: HTMLElement) {
  return Array.from(
    within(sheet)
      .getByRole('group', { name: 'Calendar' })
      .querySelectorAll<HTMLButtonElement>('button[data-iso]'),
  );
}
