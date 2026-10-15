import {
  BarcodeDetector,
  setZXingModuleOverrides,
} from 'barcode-detector/ponyfill';
import wasmUrl from 'zxing-wasm/reader/zxing_reader.wasm?url';
import type { BarcodeFormat } from 'barcode-detector/ponyfill';

/**
 * The ZXing WASM decoder, for browsers with no `BarcodeDetector` (Firefox, iOS Safari). This module
 * and the WASM it fetches are only ever loaded by a dynamic import, the first time Barcode is
 * used. The WASM is served from our own origin, not the library's default CDN.
 */
export function createZXingDetector(formats: string[]) {
  setZXingModuleOverrides({
    locateFile: (path: string, prefix: string) =>
      path.endsWith('.wasm') ? wasmUrl : prefix + path,
  });
  return new BarcodeDetector({ formats: formats as BarcodeFormat[] });
}
