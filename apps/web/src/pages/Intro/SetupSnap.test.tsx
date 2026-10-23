import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../App';
import { renderWithProviders, stubApi } from '../../test/render';

/** The router's current path and query, for asserting where a click went. */
function Where() {
  const { pathname, search } = useLocation();
  return <output aria-label="Where">{pathname + search}</output>;
}

/** A signed-in Member who is not done with the Intro, on a server that can transcribe. */
function stubMember() {
  const { fetchMock } = stubApi({
    'GET /api/auth/get-session': () =>
      Response.json({
        user: { id: '1', name: 'Ana', email: 'ana@example.com' },
      }),
    'GET /api/settings/preferences': () =>
      Response.json({ introDone: false, theme: null, locale: 'en' }),
    'GET /api/voice/config': () => Response.json({ configured: true }),
  });
  vi.stubGlobal('fetch', fetchMock);
}

async function openSnap() {
  stubMember();
  renderWithProviders(
    <>
      <App />
      <Where />
    </>,
    { route: '/intro/setup' },
  );
  const user = userEvent.setup();
  await user.click(await screen.findByRole('button', { name: /Show me how/ }));
  await screen.findByRole('radiogroup', { name: "What's in front of you?" });
  return user;
}

const where = () => screen.getByLabelText('Where').textContent;

/** Everything in the Dock that is not the camera. */
const dimmed = () =>
  ['Home', 'Shopping', 'Pantry', 'Recipes', 'Hold to record a Voice Note'].map(
    (name) => screen.getByRole('button', { name }),
  );

describe('Setup 1, Snap', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('opens from "Show me how" and asks what is in front of the Member', async () => {
    await openSnap();
    expect(where()).toBe('/intro/snap');
    expect(screen.getByText('1 of 2')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Gator, talking' })).toBeVisible();
    const choices = screen.getByRole('radiogroup', {
      name: "What's in front of you?",
    });
    expect(
      within(choices).getByRole('radio', { name: 'Ingredients' }),
    ).toBeChecked();
    expect(
      within(choices).getByRole('radio', { name: 'Receipt' }),
    ).not.toBeChecked();
    expect(screen.getByText('Tap the camera to start')).toBeInTheDocument();
  });

  it("makes Gator's line follow the pick", async () => {
    const user = await openSnap();
    expect(
      screen.getByText(
        "Put some food on the counter and snap it. I'll work out what it all is.",
      ),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'Receipt' }));
    expect(
      screen.getByText(
        "Snap the receipt from your last shop. I'll put the whole shop away.",
      ),
    ).toBeInTheDocument();
  });

  it('lets only the camera be used: the tabs and the mic are dimmed, out of the tab order and do nothing', async () => {
    const user = await openSnap();
    for (const control of dimmed()) {
      expect(control).toHaveAttribute('aria-disabled', 'true');
      expect(control).toHaveAttribute('tabindex', '-1');
    }

    // Tab around the whole screen: the dimmed parts are never reached.
    const reached = new Set<Element | null>();
    for (let i = 0; i < 8; i += 1) {
      await user.tab();
      reached.add(document.activeElement);
    }
    for (const control of dimmed()) expect(reached.has(control)).toBe(false);
    expect(reached.has(screen.getByRole('link', { name: 'Camera' }))).toBe(
      true,
    );

    for (const control of dimmed()) await user.click(control);
    expect(where()).toBe('/intro/snap');
  });

  it('opens the camera in the picked mode', async () => {
    const user = await openSnap();
    expect(screen.getByRole('link', { name: 'Camera' })).toHaveAttribute(
      'href',
      '/scan?mode=ingredients',
    );
    await user.click(screen.getByRole('radio', { name: 'Receipt' }));
    const camera = screen.getByRole('link', { name: 'Camera' });
    expect(camera).toHaveAttribute('href', '/scan?mode=receipt');

    await user.click(camera);
    expect(where()).toBe('/scan?mode=receipt');
  });

  it('skips to All set', async () => {
    const user = await openSnap();
    await user.click(screen.getByRole('link', { name: 'Skip' }));
    expect(where()).toBe('/intro/all-set');
  });

  it('is on the olive ground in the light look', async () => {
    await openSnap();
    expect(document.querySelector('[data-theme="warm"]')).not.toBeNull();
  });
});
