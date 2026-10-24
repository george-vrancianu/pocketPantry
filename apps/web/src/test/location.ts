import { screen, within } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';

const queries = (scope?: HTMLElement) => (scope ? within(scope) : screen);

/** The Location toggle (the group named by its caption, "Location" by default), in `scope` or the whole screen. */
export function locationToggle(scope?: HTMLElement, name = 'Location') {
  return queries(scope).getByRole('group', { name });
}

/** The accessible name of the pressed Location in the toggle. */
export function pressedLocation(scope?: HTMLElement, name = 'Location') {
  const pressed = within(locationToggle(scope, name))
    .getAllByRole('button')
    .filter((button) => button.getAttribute('aria-pressed') === 'true');
  if (pressed.length !== 1)
    throw new Error(`expected one pressed Location, got ${pressed.length}`);
  return pressed[0].getAttribute('aria-label') ?? pressed[0].textContent;
}

/** Press a Location (by its full name, e.g. "Freezer") in the toggle. */
export async function pickLocation(
  user: UserEvent,
  location: string,
  scope?: HTMLElement,
  name = 'Location',
) {
  await user.click(
    within(locationToggle(scope, name)).getByRole('button', {
      name: location,
    }),
  );
}
