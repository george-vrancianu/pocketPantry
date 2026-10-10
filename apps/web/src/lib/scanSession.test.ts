import { describe, expect, it } from 'vitest';
import type { ProposedLine } from './scan';
import {
  MAX_CONCURRENT_READS,
  capReached,
  emptySession,
  pendingCount,
  sessionReducer,
  type SessionAction,
  type SessionState,
} from './scanSession';

const line: ProposedLine = {
  name: 'Milk',
  match: null,
  lowConfidence: false,
  quantity: null,
  unit: null,
  expiryDate: null,
  sourceText: null,
  productDescription: null,
};

const enqueue = (
  id: string,
  extra: Partial<Extract<SessionAction, { type: 'enqueue' }>['scan']> = {},
): SessionAction => ({
  type: 'enqueue',
  scan: {
    id,
    mode: 'product',
    scanLanguage: 'en',
    image: `image-${id}`,
    thumbnail: `thumb-${id}`,
    ...extra,
  },
});

const run = (...actions: SessionAction[]): SessionState =>
  actions.reduce(sessionReducer, emptySession);
const status = (state: SessionState) =>
  state.scans.map((scan) => [scan.id, scan.status]);

describe('Scan Session reducer', () => {
  it('starts empty', () => {
    expect(emptySession.scans).toEqual([]);
    expect(pendingCount(emptySession)).toBe(0);
  });

  it('allows 2 reads at a time', () => {
    expect(MAX_CONCURRENT_READS).toBe(2);
  });

  describe('enqueue', () => {
    it('appends a Scan in capture order, waiting to be read', () => {
      const state = run(enqueue('a'), enqueue('b'), enqueue('c'));
      expect(state.scans.map((scan) => scan.id)).toEqual(['a', 'b', 'c']);
      expect(state.scans.every((scan) => scan.status === 'queued')).toBe(true);
    });

    it('keeps each Scan own mode, Scan Language, image and thumbnail', () => {
      const state = run(
        enqueue('a', { mode: 'receipt', scanLanguage: 'ro' }),
        enqueue('b', { mode: 'plate', scanLanguage: undefined }),
      );
      expect(state.scans[0]).toMatchObject({
        mode: 'receipt',
        scanLanguage: 'ro',
        image: 'image-a',
        thumbnail: 'thumb-a',
      });
      expect(state.scans[1]).toMatchObject({ mode: 'plate' });
      expect(state.scans[1].scanLanguage).toBeUndefined();
    });

    it('does not start a read by itself', () => {
      const state = run(enqueue('a'));
      expect(status(state)).toEqual([['a', 'queued']]);
    });

    it('does not change the earlier state', () => {
      const before = run(enqueue('a'));
      sessionReducer(before, enqueue('b'));
      expect(before.scans).toHaveLength(1);
    });
  });

  describe('a gallery receipt', () => {
    const source = new Blob(['x']);

    it('waits uncropped when it is enqueued with its source photo', () => {
      const state = run(enqueue('a', { mode: 'receipt', source }));
      expect(status(state)).toEqual([['a', 'uncropped']]);
    });

    it('is not started by start', () => {
      const state = run(enqueue('a', { mode: 'receipt', source }), {
        type: 'start',
      });
      expect(status(state)).toEqual([['a', 'uncropped']]);
    });

    it('does not use up a read slot', () => {
      const state = run(
        enqueue('a', { mode: 'receipt', source }),
        enqueue('b'),
        enqueue('c'),
        { type: 'start' },
      );
      expect(status(state)).toEqual([
        ['a', 'uncropped'],
        ['b', 'reading'],
        ['c', 'reading'],
      ]);
    });

    it('is pending until it is cropped and read', () => {
      expect(pendingCount(run(enqueue('a', { source })))).toBe(1);
    });

    it('crop gives it the cropped image and queues it for reading', () => {
      const state = run(enqueue('a', { mode: 'receipt', source }), {
        type: 'crop',
        id: 'a',
        image: 'cropped',
      });
      expect(status(state)).toEqual([['a', 'queued']]);
      expect(state.scans[0].image).toBe('cropped');
      expect(state.scans[0].source).toBeUndefined();
      expect(sessionReducer(state, { type: 'start' }).scans[0].status).toBe(
        'reading',
      );
    });

    it('crop leaves the other Scans alone', () => {
      const state = run(enqueue('a', { source }), enqueue('b', { source }), {
        type: 'crop',
        id: 'b',
        image: 'cropped',
      });
      expect(status(state)).toEqual([
        ['a', 'uncropped'],
        ['b', 'queued'],
      ]);
    });
  });

  describe('start', () => {
    it('starts the oldest waiting Scans, at most 2 reading at once', () => {
      const state = run(
        enqueue('a'),
        enqueue('b'),
        enqueue('c'),
        enqueue('d'),
        { type: 'start' },
      );
      expect(status(state)).toEqual([
        ['a', 'reading'],
        ['b', 'reading'],
        ['c', 'queued'],
        ['d', 'queued'],
      ]);
    });

    it('starts only one when one read is already running', () => {
      const state = run(
        enqueue('a'),
        { type: 'start' },
        enqueue('b'),
        enqueue('c'),
        {
          type: 'start',
        },
      );
      expect(status(state)).toEqual([
        ['a', 'reading'],
        ['b', 'reading'],
        ['c', 'queued'],
      ]);
    });

    it('does nothing with an empty Scan Session', () => {
      expect(sessionReducer(emptySession, { type: 'start' })).toEqual(
        emptySession,
      );
    });

    it('is idempotent', () => {
      const once = run(enqueue('a'), enqueue('b'), enqueue('c'), {
        type: 'start',
      });
      expect(sessionReducer(once, { type: 'start' })).toEqual(once);
    });
  });

  describe('read', () => {
    it('marks the Scan read and keeps its lines', () => {
      const state = run(
        enqueue('a'),
        { type: 'start' },
        {
          type: 'read',
          id: 'a',
          lines: [line],
        },
      );
      expect(state.scans[0]).toMatchObject({ status: 'read', lines: [line] });
    });

    it('frees a slot so the next waiting Scan can start', () => {
      const state = run(
        enqueue('a'),
        enqueue('b'),
        enqueue('c'),
        { type: 'start' },
        { type: 'read', id: 'a', lines: [line] },
        { type: 'start' },
      );
      expect(status(state)).toEqual([
        ['a', 'read'],
        ['b', 'reading'],
        ['c', 'reading'],
      ]);
    });

    it('leaves the other Scans alone', () => {
      const state = run(
        enqueue('a'),
        enqueue('b'),
        { type: 'start' },
        {
          type: 'read',
          id: 'b',
          lines: [line],
        },
      );
      expect(status(state)).toEqual([
        ['a', 'reading'],
        ['b', 'read'],
      ]);
    });

    it('ignores a read for a Scan that was removed meanwhile', () => {
      const state = run(
        enqueue('a'),
        { type: 'start' },
        { type: 'remove', id: 'a' },
        { type: 'read', id: 'a', lines: [line] },
      );
      expect(state.scans).toEqual([]);
    });
  });

  describe('remove', () => {
    it('drops the Scan and keeps the order of the rest', () => {
      const state = run(enqueue('a'), enqueue('b'), enqueue('c'), {
        type: 'remove',
        id: 'b',
      });
      expect(state.scans.map((scan) => scan.id)).toEqual(['a', 'c']);
    });

    it('frees the read slot of a Scan removed while reading', () => {
      const state = run(
        enqueue('a'),
        enqueue('b'),
        enqueue('c'),
        { type: 'start' },
        { type: 'remove', id: 'a' },
        { type: 'start' },
      );
      expect(status(state)).toEqual([
        ['b', 'reading'],
        ['c', 'reading'],
      ]);
    });

    it('ignores an unknown id', () => {
      const before = run(enqueue('a'));
      expect(sessionReducer(before, { type: 'remove', id: 'zzz' })).toEqual(
        before,
      );
    });
  });

  describe('pendingCount', () => {
    it('counts the Scans still waiting or reading, not the read ones', () => {
      const state = run(
        enqueue('a'),
        enqueue('b'),
        enqueue('c'),
        {
          type: 'start',
        },
        { type: 'read', id: 'a', lines: [line] },
      );
      expect(pendingCount(state)).toBe(2);
    });

    it('is zero when every Scan is read', () => {
      const state = run(
        enqueue('a'),
        { type: 'start' },
        {
          type: 'read',
          id: 'a',
          lines: [line],
        },
      );
      expect(pendingCount(state)).toBe(0);
    });
  });

  describe('fail', () => {
    it('marks a reading Scan failed and keeps its image for a retry', () => {
      const state = run(
        enqueue('a'),
        { type: 'start' },
        {
          type: 'fail',
          id: 'a',
          reason: 'error',
        },
      );
      expect(state.scans[0]).toMatchObject({
        status: 'failed',
        failure: 'error',
        image: 'image-a',
        thumbnail: 'thumb-a',
      });
    });

    it('records the Scan Cap as its own reason', () => {
      const state = run(
        enqueue('a'),
        { type: 'start' },
        {
          type: 'fail',
          id: 'a',
          reason: 'cap',
        },
      );
      expect(state.scans[0]).toMatchObject({
        status: 'failed',
        failure: 'cap',
      });
    });

    it('leaves the other Scans alone and frees the read slot', () => {
      const state = run(
        enqueue('a'),
        enqueue('b'),
        enqueue('c'),
        { type: 'start' },
        { type: 'fail', id: 'a', reason: 'error' },
        { type: 'start' },
      );
      expect(status(state)).toEqual([
        ['a', 'failed'],
        ['b', 'reading'],
        ['c', 'reading'],
      ]);
    });

    it('does not count a failed Scan as pending', () => {
      const state = run(
        enqueue('a'),
        enqueue('b'),
        { type: 'start' },
        {
          type: 'fail',
          id: 'a',
          reason: 'error',
        },
      );
      expect(pendingCount(state)).toBe(1);
    });

    it('keeps the order of the Scans', () => {
      const state = run(
        enqueue('a'),
        enqueue('b'),
        { type: 'start' },
        {
          type: 'fail',
          id: 'a',
          reason: 'error',
        },
      );
      expect(state.scans.map((scan) => scan.id)).toEqual(['a', 'b']);
    });
  });

  describe('fail with an error code', () => {
    const failedWith = () =>
      run(
        enqueue('a'),
        { type: 'start' },
        {
          type: 'fail',
          id: 'a',
          reason: 'error',
          code: 'scan.too_many_items',
          params: { max: 50 },
        },
      );

    it('keeps the code and params apart from the failure reason', () => {
      expect(failedWith().scans[0]).toMatchObject({
        status: 'failed',
        failure: 'error',
        errorCode: 'scan.too_many_items',
        errorParams: { max: 50 },
      });
    });

    it('stores no code when none is given', () => {
      const state = run(
        enqueue('a'),
        { type: 'start' },
        {
          type: 'fail',
          id: 'a',
          reason: 'error',
        },
      );
      expect(state.scans[0].errorCode).toBeUndefined();
    });

    it('forgets the code on retry', () => {
      const state = sessionReducer(failedWith(), { type: 'retry', id: 'a' });
      expect(state.scans[0].errorCode).toBeUndefined();
      expect(state.scans[0].errorParams).toBeUndefined();
    });
  });

  describe('retry', () => {
    const failed = (reason: 'error' | 'cap' = 'error') =>
      run(enqueue('a'), { type: 'start' }, { type: 'fail', id: 'a', reason });

    it('puts a failed Scan back in line with the same image', () => {
      const state = sessionReducer(failed(), { type: 'retry', id: 'a' });
      expect(state.scans[0]).toMatchObject({
        status: 'queued',
        image: 'image-a',
        thumbnail: 'thumb-a',
      });
      expect(state.scans[0].failure).toBeUndefined();
    });

    it('is read again by the next start', () => {
      const state = run(
        enqueue('a'),
        { type: 'start' },
        { type: 'fail', id: 'a', reason: 'error' },
        { type: 'retry', id: 'a' },
        { type: 'start' },
      );
      expect(status(state)).toEqual([['a', 'reading']]);
    });

    it('only acts on failed Scans', () => {
      const reading = run(enqueue('a'), { type: 'start' });
      expect(sessionReducer(reading, { type: 'retry', id: 'a' })).toEqual(
        reading,
      );
      const read = run(
        enqueue('b'),
        { type: 'start' },
        {
          type: 'read',
          id: 'b',
          lines: [line],
        },
      );
      expect(sessionReducer(read, { type: 'retry', id: 'b' })).toEqual(read);
    });

    it('does nothing for an unknown Scan', () => {
      const state = failed();
      expect(sessionReducer(state, { type: 'retry', id: 'zzz' })).toEqual(
        state,
      );
    });

    it('can fail and be retried again', () => {
      const state = run(
        enqueue('a'),
        { type: 'start' },
        { type: 'fail', id: 'a', reason: 'error' },
        { type: 'retry', id: 'a' },
        { type: 'start' },
        { type: 'fail', id: 'a', reason: 'error' },
      );
      expect(status(state)).toEqual([['a', 'failed']]);
    });
  });

  describe('capReached', () => {
    it('is false for an empty Scan Session and for ordinary failures', () => {
      expect(capReached(emptySession)).toBe(false);
      expect(
        capReached(
          run(
            enqueue('a'),
            { type: 'start' },
            {
              type: 'fail',
              id: 'a',
              reason: 'error',
            },
          ),
        ),
      ).toBe(false);
    });

    it('is true while a Scan failed on the Scan Cap', () => {
      const state = run(
        enqueue('a'),
        { type: 'start' },
        {
          type: 'fail',
          id: 'a',
          reason: 'cap',
        },
      );
      expect(capReached(state)).toBe(true);
    });

    it('is lifted by removing that Scan or retrying it', () => {
      const state = run(
        enqueue('a'),
        { type: 'start' },
        {
          type: 'fail',
          id: 'a',
          reason: 'cap',
        },
      );
      expect(
        capReached(sessionReducer(state, { type: 'remove', id: 'a' })),
      ).toBe(false);
      expect(
        capReached(sessionReducer(state, { type: 'retry', id: 'a' })),
      ).toBe(false);
    });
  });
});
