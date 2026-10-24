import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { recordAndSend, resetVoiceEnvironment, stubVoiceFetch } from './voice';
import { voiceNote } from '../lib/voiceNote';

describe('the fake voice environment: pending reads', () => {
  beforeEach(() => resetVoiceEnvironment());
  afterEach(() => vi.unstubAllGlobals());

  it('keeps a read pending until the test resolves it', async () => {
    const fetchMock = vi.fn();
    const fake = stubVoiceFetch(fetchMock);
    fake.holdReads();

    await recordAndSend({ spokenLanguage: 'en', defaultTarget: 'shopping' });
    await vi.waitFor(() => expect(fake.reads).toHaveLength(1));
    expect(voiceNote.getState().phase).toBe('reading');
    expect(fetchMock).not.toHaveBeenCalled();

    fake.reads[0].resolve(Response.json({ transcript: 'milk', actions: [] }));
    await vi.waitFor(() => expect(voiceNote.getState().phase).toBe('review'));
    expect(voiceNote.getState().proposal?.transcript).toBe('milk');
  });

  it('fails a pending read when the test rejects it', async () => {
    const fake = stubVoiceFetch(vi.fn());
    fake.holdReads();

    await recordAndSend({ spokenLanguage: 'en', defaultTarget: 'pantry' });
    await vi.waitFor(() => expect(fake.reads).toHaveLength(1));
    fake.reads[0].reject(new TypeError('Failed to fetch'));

    await vi.waitFor(() => expect(voiceNote.getState().phase).toBe('failed'));
  });

  it('answers new reads at once after releaseReads, leaving a held one held', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve(Response.json({ transcript: 'eggs', actions: [] })),
    );
    const fake = stubVoiceFetch(fetchMock);
    fake.holdReads();

    await recordAndSend({ spokenLanguage: 'en', defaultTarget: 'shopping' });
    await vi.waitFor(() => expect(fake.reads).toHaveLength(1));
    fake.releaseReads();
    expect(voiceNote.getState().phase).toBe('reading');

    voiceNote.cancelReading();
    await recordAndSend({ spokenLanguage: 'en', defaultTarget: 'shopping' });
    await vi.waitFor(() => expect(voiceNote.getState().phase).toBe('review'));
    expect(fake.reads).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('Cancel reading aborts a held read', async () => {
    const fake = stubVoiceFetch(vi.fn());
    fake.holdReads();

    await recordAndSend({ spokenLanguage: 'en', defaultTarget: 'shopping' });
    await vi.waitFor(() => expect(fake.reads).toHaveLength(1));
    voiceNote.cancelReading();

    expect(fake.signals[0].aborted).toBe(true);
    expect(voiceNote.getState().phase).toBe('idle');
  });
});
