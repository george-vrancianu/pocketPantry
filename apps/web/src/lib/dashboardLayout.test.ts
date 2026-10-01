import { describe, expect, it } from 'vitest';
import type { WidgetInstance } from './dashboard';
import {
  addWidget,
  availableWidgetTypes,
  moveWidget,
  removeWidget,
  resizeWidget,
} from './dashboardLayout';

const a: WidgetInstance = { id: 'a', type: 'use-soon', size: 'wide' };
const b: WidgetInstance = { id: 'b', type: 'shopping', size: 'small' };
const c: WidgetInstance = { id: 'c', type: 'budget', size: 'small' };

describe('dashboard layout edits', () => {
  it('moves a Widget to a new index', () => {
    expect(moveWidget([a, b, c], 'a', 2).map((w) => w.id)).toEqual([
      'b',
      'c',
      'a',
    ]);
  });

  it('ignores a move of an unknown id and clamps the index', () => {
    expect(moveWidget([a, b], 'x', 0)).toEqual([a, b]);
    expect(moveWidget([a, b], 'a', 9).map((w) => w.id)).toEqual(['b', 'a']);
  });

  it('removes a Widget', () => {
    expect(removeWidget([a, b], 'a')).toEqual([b]);
  });

  it('resizes a Widget only to a size its type supports', () => {
    expect(resizeWidget([b], 'b', 'wide')[0]?.size).toBe('wide');
    const scan: WidgetInstance = { id: 's', type: 'quick-scan', size: 'wide' };
    expect(resizeWidget([scan], 's', 'small')).toEqual([scan]);
  });

  it('adds a Widget at the end at its default size with a fresh id', () => {
    const next = addWidget([a], 'budget', () => 'new-id');
    expect(next).toEqual([a, { id: 'new-id', type: 'budget', size: 'small' }]);
  });

  it('offers only the types not already on the dashboard', () => {
    expect(availableWidgetTypes([a, b, c])).not.toContain('use-soon');
    expect(availableWidgetTypes([a, b, c])).not.toContain('budget');
    expect(availableWidgetTypes([a])).toContain('shopping');
  });
});
