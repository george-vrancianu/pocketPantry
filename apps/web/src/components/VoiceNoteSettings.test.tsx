import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
// The fake voice environment registers its mocks, so it comes before anything that reaches the microphone.
import {
  resetVoiceEnvironment,
  stubVoiceFetch,
  talkButton,
  voiceAction,
  voiceIngredient,
} from '../test/voice';
import { stubSetupMember } from '../test/intro';
import { renderWithProviders } from '../test/render';
import { holdLongEnough, pressDown, useVoiceTimers } from '../test/voiceHold';
import { VoiceHostProvider, VoiceHostSlot } from './voice/VoiceHost';
import { AppDock } from './AppDock';
import { VoiceNote, type VoiceNoteSettings } from './VoiceNote';

const HEARD = {
  transcript: 'We have rice.',
  actions: [
    voiceAction({
      id: 'a1',
      target: 'pantry',
      op: 'add',
      text: 'rice',
      ingredient: voiceIngredient('rice', 'Rice'),
      defaults: { location: 'cupboard' },
    }),
  ],
};
const APPLIED = {
  applied: [
    { actionId: 'a1', list: 'pantry', rowId: 'row-a1', alreadyDone: false },
  ],
  skipped: [],
};

/** The host alone, on a page with no list of its own, driven only by its settings. */
async function host(settings?: VoiceNoteSettings) {
  stubSetupMember({
    routes: {
      'POST /api/voice': () => Response.json(HEARD, { status: 201 }),
      'POST /api/voice/apply': () => Response.json(APPLIED, { status: 201 }),
    },
  });
  const { sent } = stubVoiceFetch(globalThis.fetch as never);
  renderWithProviders(
    <>
      <VoiceHostProvider>
        <VoiceHostSlot />
        <VoiceNote settings={settings} />
        <AppDock />
      </VoiceHostProvider>
    </>,
    { route: '/recipes' },
  );
  const button = await talkButton();
  pressDown(button);
  await screen.findByText("Gator's listening");
  await holdLongEnough();
  fireEvent.pointerUp(button);
  return { sent };
}

describe('the Voice Note host settings', () => {
  beforeEach(() => {
    useVoiceTimers();
    resetVoiceEnvironment();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('forces its Default List, opens the note when read and hands the apply to afterApply', async () => {
    const afterApply = vi.fn();
    const { sent } = await host({
      indicator: 'pill',
      openWhenReady: true,
      defaultTarget: 'pantry',
      afterApply,
    });
    const review = await screen.findByRole('dialog', {
      name: "Here's what I heard",
    });
    expect(sent[0].get('defaultTarget')).toBe('pantry');
    await userEvent
      .setup()
      .click(within(review).getByRole('button', { name: 'Do this one' }));
    await vi.waitFor(() => expect(afterApply).toHaveBeenCalledTimes(1));
    expect(afterApply.mock.calls[0][0]).toEqual(APPLIED);
    expect(afterApply.mock.calls[0][1]).toHaveLength(1);
  });

  it('with the app settings the route decides the Default List and the note waits in the Voice Inbox', async () => {
    const { sent } = await host();
    expect(await screen.findByText(/ready/i)).toBeVisible();
    expect(sent[0].get('defaultTarget')).toBe('none');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
