import { describe, expect, it } from 'vitest';
import { summariseStack } from './photoStack';
import type { SessionScan } from './scanSession';

const card = (
  status: SessionScan['status'],
  mode: SessionScan['mode'] = 'product',
): SessionScan => ({ id: crypto.randomUUID(), mode, thumbnail: '', status });

describe('summariseStack', () => {
  it('is empty with no cards', () => {
    expect(summariseStack([])).toMatchObject({
      count: 0,
      photos: 0,
      barcodes: 0,
    });
  });

  it('counts every card, split into photos and barcodes', () => {
    const summary = summariseStack([
      card('read'),
      card('read', 'receipt'),
      card('read', 'barcode'),
    ]);
    expect(summary).toMatchObject({ count: 3, photos: 2, barcodes: 1 });
  });

  it('is reading while any Scan is waiting for a slot or being read', () => {
    expect(summariseStack([card('read'), card('queued')]).state).toBe(
      'reading',
    );
    expect(summariseStack([card('reading')])).toMatchObject({
      state: 'reading',
      reading: 1,
    });
  });

  it('is needs crop when a gallery receipt waits and nothing is reading', () => {
    expect(
      summariseStack([card('read'), card('uncropped', 'receipt')]),
    ).toMatchObject({ state: 'needsCrop', needsCrop: 1 });
  });

  it('is failed when a Scan failed and nothing is reading or waiting for a crop', () => {
    expect(summariseStack([card('read'), card('failed')])).toMatchObject({
      state: 'failed',
      failed: 1,
    });
  });

  it('is read when every card is read', () => {
    expect(summariseStack([card('read'), card('read', 'barcode')]).state).toBe(
      'read',
    );
  });

  it('first match wins: reading beats needs crop beats failed', () => {
    const all = [card('failed'), card('uncropped', 'receipt'), card('reading')];
    expect(summariseStack(all).state).toBe('reading');
    expect(summariseStack(all.slice(0, 2)).state).toBe('needsCrop');
    expect(summariseStack(all.slice(0, 1)).state).toBe('failed');
  });

  it('shows the last three cards, newest first', () => {
    const cards = [card('read'), card('read'), card('read'), card('read')];
    expect(summariseStack(cards).top.map((c) => c.id)).toEqual([
      cards[3].id,
      cards[2].id,
      cards[1].id,
    ]);
  });
});
