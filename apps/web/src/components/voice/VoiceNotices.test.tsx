import { act, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { recording, resetVoiceEnvironment } from '../../test/voice';
import { renderWithProviders, stubApi } from '../../test/render';
import { voiceNote } from '../../lib/voiceNote';

/** A page with no Voice Note button: the notices still speak. */
const Elsewhere = () => <p>Somewhere else</p>;

const readOn = (reply: () => Response | Promise<Response>) => {
  const { fetchMock } = stubApi({ 'POST /api/voice': reply });
  vi.stubGlobal('fetch', fetchMock);
};

const start = () =>
  voiceNote.read(recording, {
    scanLanguage: 'en',
    locale: 'en',
    page: 'shopping',
  });

describe('Voice Note notices at the app root', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    resetVoiceEnvironment();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('says a cancelled read was not saved, on a page with no Voice Note button', async () => {
    readOn(() => new Promise<Response>(() => undefined));
    renderWithProviders(<Elsewhere />);
    void start();

    act(() => voiceNote.cancelReading());

    expect(
      await screen.findByText('Cancelled. Nothing was saved.'),
    ).toBeVisible();
  });

  it('says a failed recording was discarded', async () => {
    readOn(() =>
      Response.json(
        { code: 'voice.provider_unavailable', params: {} },
        { status: 502 },
      ),
    );
    renderWithProviders(<Elsewhere />);
    await act(() => start());

    act(() => voiceNote.discardFailed());

    expect(await screen.findByText('Recording discarded')).toBeVisible();
  });

  it('turns Voice Notes switched off into the cached configuration, quietly', async () => {
    readOn(() =>
      Response.json(
        { code: 'voice.not_configured', params: {} },
        { status: 503 },
      ),
    );
    const { queryClient } = renderWithProviders(<Elsewhere />);
    queryClient.setQueryData(['voice', 'config'], { configured: true });

    await act(() => start());

    expect(queryClient.getQueryData(['voice', 'config'])).toEqual({
      configured: false,
    });
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
