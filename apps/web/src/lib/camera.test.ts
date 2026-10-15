import { afterEach, describe, expect, it, vi } from 'vitest';
import { cameraConstraints } from './camera';

describe('cameraConstraints', () => {
  it('asks for the rear camera at an ideal (never exact) 1080p, in every Scan Mode', () => {
    expect(cameraConstraints()).toEqual({
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    });
  });
});

describe('barcode detection', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.doUnmock('./barcodeDecoder');
    vi.resetModules();
  });

  const video = { readyState: 4 } as HTMLVideoElement;

  it('uses the browser BarcodeDetector where it reads all four formats, without loading the ponyfill', async () => {
    const ponyfill = vi.fn();
    vi.doMock('./barcodeDecoder', () => {
      ponyfill();
      return { createZXingDetector: vi.fn() };
    });
    const formats: string[][] = [];
    class Native {
      static getSupportedFormats = () =>
        Promise.resolve(['ean_13', 'ean_8', 'upc_a', 'upc_e', 'qr_code']);
      constructor(options: { formats: string[] }) {
        formats.push(options.formats);
      }
      detect = () => Promise.resolve([{ rawValue: '3017620422003' }]);
    }
    vi.stubGlobal('BarcodeDetector', Native);
    const { readBarcode } = await import('./camera');
    expect(await readBarcode(video)).toBe('3017620422003');
    expect(formats).toEqual([['ean_13', 'ean_8', 'upc_a', 'upc_e']]);
    expect(ponyfill).not.toHaveBeenCalled();
  });

  it('loads the ZXing ponyfill only on first use, when the browser has no detector', async () => {
    const ponyfill = vi.fn();
    vi.doMock('./barcodeDecoder', () => {
      ponyfill();
      return {
        createZXingDetector: () => ({
          detect: () => Promise.resolve([{ rawValue: '12345670' }]),
        }),
      };
    });
    const { readBarcode } = await import('./camera');
    expect(ponyfill).not.toHaveBeenCalled();
    expect(await readBarcode(video)).toBe('12345670');
    expect(ponyfill).toHaveBeenCalledTimes(1);
  });

  it('ignores a code that is not an EAN/UPC length', async () => {
    vi.doMock('./barcodeDecoder', () => ({
      createZXingDetector: () => ({
        detect: () => Promise.resolve([{ rawValue: '123' }]),
      }),
    }));
    const { readBarcode } = await import('./camera');
    expect(await readBarcode(video)).toBeNull();
  });
});
