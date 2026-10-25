import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { paintedColour } from '@pocket-pantry/ui/test/colour';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetVoiceEnvironment, stubVoiceFetch } from '../../test/voice';
import { useVoiceTimers } from '../../test/voiceHold';
import { renderInAppLayout, stubApi } from '../../test/render';
import { PantryPage } from './PantryPage';

function setup(voiceConfigured = true) {
  const { fetchMock } = stubApi({
    'GET /api/pantry/recently-stocked': () =>
      Response.json({ ingredients: [] }),
    'GET /api/pantry': () => Response.json({ batches: [], runningLow: [] }),
    'GET /api/voice/config': () =>
      Response.json({ configured: voiceConfigured }),
    'GET /api/catalog/search': () => Response.json({ results: [] }),
  });
  return stubVoiceFetch(fetchMock);
}

const callout = () => screen.queryByText('Hold the mic, talk, let go');
const litMic = () =>
  document.querySelector('[data-dock-capsule] > div:last-child');

async function sayIt() {
  renderInAppLayout(<PantryPage />, '/pantry');
  await userEvent.click(
    await screen.findByRole('button', { name: 'Add batch' }),
  );
  await userEvent.click(await screen.findByRole('button', { name: 'Say it' }));
  await screen.findByText('Hold the mic, talk, let go');
}

describe('Say it in the Add to Pantry sheet', () => {
  beforeEach(() => {
    useVoiceTimers();
    resetVoiceEnvironment();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('closes the sheet, lights the mic and shows the callout', async () => {
    setup();
    await sayIt();
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Add to Pantry' }),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByText(/two litres of milk/)).toBeInTheDocument();
    expect(paintedColour(litMic()!, 'background-color').toUpperCase()).toBe(
      '#F0C96B',
    );
    // Nothing else is disabled.
    expect(
      screen
        .getByRole('link', { name: 'Recipes' })
        .hasAttribute('aria-disabled'),
    ).toBe(false);
    expect(
      screen
        .getByRole('link', { name: 'Camera' })
        .hasAttribute('aria-disabled'),
    ).toBe(false);
  });

  it('clears after 4.8 s', async () => {
    setup();
    await sayIt();
    await act(() => vi.advanceTimersByTimeAsync(4700));
    expect(callout()).toBeInTheDocument();
    await act(() => vi.advanceTimersByTimeAsync(200));
    expect(callout()).not.toBeInTheDocument();
  });

  it('clears on a tap outside the capsule', async () => {
    setup();
    await sayIt();
    fireEvent.pointerDown(document.body);
    expect(callout()).not.toBeInTheDocument();
  });

  it('clears when the mic is pressed, and the press starts a Voice Note for the Pantry', async () => {
    const { sent } = setup();
    await sayIt();
    const mic = await screen.findByRole('button', {
      name: /hold to record a voice note/i,
    });
    fireEvent.pointerDown(mic, { isPrimary: true });
    expect(callout()).not.toBeInTheDocument();
    await screen.findByText("Gator's listening");
    expect(sent).toBeDefined();
  });

  it('shows no Say it tile where there is no mic', async () => {
    setup(false);
    renderInAppLayout(<PantryPage />, '/pantry');
    await userEvent.click(
      await screen.findByRole('button', { name: 'Add batch' }),
    );
    await screen.findByRole('button', { name: 'Take a photo' });
    expect(screen.queryByRole('button', { name: 'Say it' })).toBeNull();
  });
});
