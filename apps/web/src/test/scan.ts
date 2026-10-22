import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect } from 'react';
import { beforeEach, vi } from 'vitest';
import type { CameraStatus, FocusPass } from '../lib/camera';

/** The Scan guide, which takes a Scan on a double-tap. */
export const scanGuide = () => screen.getByTestId('scan-guide');

/** Double-tap the Scan guide, as a Member takes a Scan. */
export function scanViaGuide() {
  const pointer = {
    pointerId: 1,
    pointerType: 'touch',
    isPrimary: true,
    button: 0,
  };
  for (let i = 0; i < 2; i += 1) {
    fireEvent.pointerDown(scanGuide(), pointer);
    fireEvent.pointerUp(scanGuide(), pointer);
  }
}

/** Done, then the first card once it is read: the line editor for that Scan. */
export async function openFirstScanCard() {
  await userEvent.click(await screen.findByRole('button', { name: /^Done/ }));
  const [card] = await screen.findAllByTestId('card-result');
  await userEvent.click(card);
}

/**
 * The ONE fake camera for every Scan page and add-Batch camera test. jsdom has no camera, so the
 * camera module is the seam. Each test file only mounts it, with this one line (`vi.mock` is
 * hoisted, so the factory has to import this file lazily):
 *
 *   vi.mock('../../lib/camera', async () => (await import('../../test/scan')).fakeCameraModule());
 *
 * Tests then set `fakeCamera` fields. The state resets before every test (the factory registers
 * `beforeEach(resetFakeCamera)`), so nothing leaks between tests.
 *
 * To add a capability (e.g. zoom): add the field here with its default in `defaults()`, and have
 * `fakeUseCamera` return it (e.g. `zoomSupported`). Nothing else changes.
 */
export const fakeCamera = {
  /** `'ready'`, or `'unavailable'` for a denied permission / no camera. Read when the screen renders. */
  status: 'ready' as CameraStatus,
  /** Whether the camera has a torch; the flash toggle shows only then. */
  torchSupported: true,
  /** Whether it supports `single-shot` focus. Off: a Scan's focus pass is the steady 400 ms pause. */
  focusSupported: false,
  /** The frame a Scan captures (null: no live frame, so the capture yields nothing). */
  frame: null as Blob | null,
  /** Barcodes in Barcode mode: the live watch. Emit a code with `emitBarcode`. */
  emit: null as ((code: string) => void) | null,
  /** How many barcode watches are running. */
  watching: 0,
  /**
   * What `readBarcode` (a Scan's photo or frame) answers: the nth read runs `reads[n]`, then null.
   * Set `deferReads` to answer by hand instead through `pendingReads` (resolve or reject each).
   */
  reads: [] as Array<() => Promise<string | null>>,
  readCount: 0,
  deferReads: false,
  pendingReads: [] as Array<{
    source: Blob;
    resolve: (code: string | null) => void;
    reject: (error: Error) => void;
  }>,
  /** Focus passes started, and cancelled; `finishFocus` ends the latest one (single-shot only). */
  focuses: 0,
  cancels: 0,
  /** The camera stream's lifecycle: `useCamera` mounted / unmounted. */
  starts: 0,
  stops: 0,
  /** The first argument of each `useCamera` call. */
  calls: [] as unknown[],
  finishFocus: () => {},
};

const defaults = () => ({
  status: 'ready' as CameraStatus,
  torchSupported: true,
  focusSupported: false,
  frame: new Blob(['frame'], { type: 'image/jpeg' }),
  emit: null,
  watching: 0,
  reads: [],
  readCount: 0,
  deferReads: false,
  pendingReads: [],
  focuses: 0,
  cancels: 0,
  starts: 0,
  stops: 0,
  calls: [],
  finishFocus: () => {},
});

/** Puts the fake camera back to a ready, torch-equipped camera with no single-shot focus and no barcodes. */
export function resetFakeCamera() {
  Object.assign(fakeCamera, defaults());
}
resetFakeCamera();

/** The camera sees `code` in Barcode mode (waits for the page to start watching). The watch then ends, as the real one does. */
export function emitBarcode(code: string) {
  fakeCamera.emit?.(code);
}

const videoRef = { current: null };
const FOCUS_PAUSE_MS = 400;

const capture = () => Promise.resolve(fakeCamera.frame);
const setTorch = () => Promise.resolve(fakeCamera.torchSupported);

function watchBarcodes(onCode: (code: string) => void) {
  let active = true;
  fakeCamera.watching += 1;
  const stop = () => {
    if (!active) return;
    active = false;
    fakeCamera.watching -= 1;
    if (fakeCamera.emit === emit) fakeCamera.emit = null;
  };
  const emit = (code: string) => {
    if (!active) return;
    stop();
    onCode(code);
  };
  fakeCamera.emit = emit;
  return stop;
}

function focusForScan(): FocusPass {
  fakeCamera.focuses += 1;
  let finish: () => void = () => {};
  const done = new Promise<void>((resolve) => (finish = resolve));
  if (!fakeCamera.focusSupported) {
    const timer = setTimeout(finish, FOCUS_PAUSE_MS);
    return {
      done,
      cancel: () => {
        fakeCamera.cancels += 1;
        clearTimeout(timer);
        finish();
      },
    };
  }
  fakeCamera.finishFocus = finish;
  return { done, cancel: () => void (fakeCamera.cancels += 1) };
}

function fakeUseCamera(...args: unknown[]) {
  fakeCamera.calls.push(args[0]);
  useEffect(() => {
    fakeCamera.starts += 1;
    return () => {
      fakeCamera.stops += 1;
    };
  }, []);
  return {
    videoRef,
    status: fakeCamera.status,
    torchSupported: fakeCamera.torchSupported,
    focusForScan,
    capture,
    setTorch,
    // A fresh function per render, as every per-file mock had: the Scan page then re-arms its watch
    // on its next render, not only after the scan interval. A stable one (like the real hook's) makes
    // the "keeps reading" ScanBarcode test wait out that interval first.
    watchBarcodes: (onCode: (code: string) => void) => watchBarcodes(onCode),
  };
}

function fakeReadBarcode(source: Blob | HTMLVideoElement) {
  const index = fakeCamera.readCount++;
  if (fakeCamera.deferReads) {
    return new Promise<string | null>((resolve, reject) =>
      fakeCamera.pendingReads.push({ source: source as Blob, resolve, reject }),
    );
  }
  return fakeCamera.reads[index]?.() ?? Promise.resolve(null);
}

/** The factory for `vi.mock('../../lib/camera', ...)`: the real module's other exports, with the camera hook and barcode reader faked. */
export async function fakeCameraModule() {
  const actual =
    await vi.importActual<typeof import('../lib/camera')>('../lib/camera');
  beforeEach(resetFakeCamera);
  return { ...actual, useCamera: fakeUseCamera, readBarcode: fakeReadBarcode };
}
