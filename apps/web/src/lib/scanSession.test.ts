import { describe, expect, it } from 'vitest';
import { MAX_RECEIPT_SECTIONS } from './receiptSections';
import type { ProposedLine } from './scan';
import {
  MAX_CONCURRENT_READS,
  canMerge,
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
});

describe('Receipt merge and split', () => {
  const named = (name: string): ProposedLine => ({ ...line, name });
  const read = (id: string, lines: ProposedLine[]): SessionAction[] => [
    { type: 'read', id, lines },
  ];
  const readThree = () => {
    let state = run(
      enqueue('a', { mode: 'receipt' }),
      enqueue('b', { mode: 'receipt' }),
      enqueue('c', { mode: 'receipt' }),
      { type: 'start' },
      ...read('a', [named('A1'), named('A2')]),
      ...read('b', [named('B1')]),
    );
    state = sessionReducer(state, { type: 'start' });
    return sessionReducer(state, {
      type: 'read',
      id: 'c',
      lines: [named('C1')],
    });
  };

  it('joins a receipt card to the receipt card above it', () => {
    const state = sessionReducer(readThree(), { type: 'merge', id: 'b' });
    expect(state.scans.map((s) => s.id)).toEqual(['a', 'c']);
    expect(state.scans[0].status).toBe('read');
  });

  it('merges lines in order, as Receipt Sections do', () => {
    const state = sessionReducer(readThree(), { type: 'merge', id: 'b' });
    expect(state.scans[0].lines?.map((l) => l.name)).toEqual([
      'A1',
      'A2',
      'B1',
    ]);
  });

  it('keeps the first section Scan Language and photo', () => {
    let state = run(
      enqueue('a', { mode: 'receipt', scanLanguage: 'ro' }),
      enqueue('b', { mode: 'receipt', scanLanguage: 'da' }),
      { type: 'start' },
      ...read('a', [named('A1')]),
      ...read('b', [named('B1')]),
    );
    state = sessionReducer(state, { type: 'merge', id: 'b' });
    expect(state.scans).toHaveLength(1);
    expect(state.scans[0].scanLanguage).toBe('ro');
    expect(state.scans[0].thumbnail).toBe('thumb-a');
  });

  it('can merge a third card into an already merged one', () => {
    let state = sessionReducer(readThree(), { type: 'merge', id: 'b' });
    state = sessionReducer(state, { type: 'merge', id: 'c' });
    expect(state.scans.map((s) => s.id)).toEqual(['a']);
    expect(state.scans[0].lines?.map((l) => l.name)).toEqual([
      'A1',
      'A2',
      'B1',
      'C1',
    ]);
  });

  describe('canMerge', () => {
    it('is true for a read receipt card below a read receipt card', () => {
      expect(canMerge(readThree(), 'b')).toBe(true);
      expect(canMerge(readThree(), 'c')).toBe(true);
    });

    it('is false for the first card', () => {
      expect(canMerge(readThree(), 'a')).toBe(false);
    });

    it('is false for an unknown card', () => {
      expect(canMerge(readThree(), 'zzz')).toBe(false);
    });

    it('is false when either card is still reading or waiting', () => {
      const state = run(
        enqueue('a', { mode: 'receipt' }),
        enqueue('b', { mode: 'receipt' }),
        enqueue('c', { mode: 'receipt' }),
        { type: 'start' },
        ...read('a', [named('A1')]),
      );
      // b reading, c waiting
      expect(canMerge(state, 'b')).toBe(false);
      expect(canMerge(state, 'c')).toBe(false);
      const reading = sessionReducer(state, {
        type: 'read',
        id: 'b',
        lines: [],
      });
      // c is now the one that is not read; a and b are
      expect(canMerge(reading, 'b')).toBe(true);
      expect(canMerge(reading, 'c')).toBe(false);
    });

    it('is false when the card above is not a receipt, or this one is not', () => {
      const state = run(
        enqueue('a'),
        enqueue('b', { mode: 'receipt' }),
        enqueue('c'),
        { type: 'start' },
        ...read('a', [named('A1')]),
        ...read('b', [named('B1')]),
      );
      expect(canMerge(state, 'b')).toBe(false);
      expect(canMerge(state, 'c')).toBe(false);
    });

    it('is false when a receipt is not adjacent to another receipt', () => {
      const state = run(
        enqueue('a', { mode: 'receipt' }),
        enqueue('x'),
        enqueue('b', { mode: 'receipt' }),
        { type: 'start' },
        ...read('a', [named('A1')]),
        ...read('x', [named('X1')]),
      );
      const done = sessionReducer(sessionReducer(state, { type: 'start' }), {
        type: 'read',
        id: 'b',
        lines: [named('B1')],
      });
      expect(canMerge(done, 'b')).toBe(false);
    });

    it('stops at 10 sections in one receipt', () => {
      const ids = Array.from({ length: MAX_RECEIPT_SECTIONS + 1 }, (_, i) =>
        String(i),
      );
      let state = run(...ids.map((id) => enqueue(id, { mode: 'receipt' })));
      for (const id of ids) {
        state = sessionReducer(state, { type: 'start' });
        state = sessionReducer(state, { type: 'read', id, lines: [named(id)] });
      }
      for (const id of ids.slice(1, MAX_RECEIPT_SECTIONS)) {
        expect(canMerge(state, id)).toBe(true);
        state = sessionReducer(state, { type: 'merge', id });
      }
      // Cards: first (10 sections) and the eleventh.
      expect(state.scans.map((s) => s.id)).toEqual([
        '0',
        String(MAX_RECEIPT_SECTIONS),
      ]);
      expect(canMerge(state, String(MAX_RECEIPT_SECTIONS))).toBe(false);
      const refused = sessionReducer(state, {
        type: 'merge',
        id: String(MAX_RECEIPT_SECTIONS),
      });
      expect(refused).toBe(state);
    });
  });

  it('ignores a merge that is not allowed', () => {
    const state = readThree();
    expect(sessionReducer(state, { type: 'merge', id: 'a' })).toBe(state);
  });

  describe('split', () => {
    it('restores the separate cards, in place, with their own lines', () => {
      const before = readThree();
      let state = sessionReducer(before, { type: 'merge', id: 'b' });
      state = sessionReducer(state, { type: 'split', id: 'a' });
      expect(state.scans.map((s) => s.id)).toEqual(['a', 'b', 'c']);
      expect(state.scans.map((s) => s.lines?.map((l) => l.name))).toEqual([
        ['A1', 'A2'],
        ['B1'],
        ['C1'],
      ]);
      expect(state.scans.every((s) => s.status === 'read')).toBe(true);
    });

    it('restores every section of a card merged more than once', () => {
      let state = sessionReducer(readThree(), { type: 'merge', id: 'b' });
      state = sessionReducer(state, { type: 'merge', id: 'c' });
      state = sessionReducer(state, { type: 'split', id: 'a' });
      expect(state.scans.map((s) => s.id)).toEqual(['a', 'b', 'c']);
    });

    it('does nothing to a card that was not merged', () => {
      const state = readThree();
      expect(sessionReducer(state, { type: 'split', id: 'a' })).toBe(state);
    });

    it('lets the Scans merge again afterwards', () => {
      let state = sessionReducer(readThree(), { type: 'merge', id: 'b' });
      state = sessionReducer(state, { type: 'split', id: 'a' });
      expect(canMerge(state, 'b')).toBe(true);
    });
  });

  it('removing a merged card removes all its sections', () => {
    let state = sessionReducer(readThree(), { type: 'merge', id: 'b' });
    state = sessionReducer(state, { type: 'remove', id: 'a' });
    expect(state.scans.map((s) => s.id)).toEqual(['c']);
  });
});
