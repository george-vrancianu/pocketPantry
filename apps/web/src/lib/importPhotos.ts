import type { ScanLanguage } from '../i18n/resources';
import { readBarcode } from './camera';
import { resizeImage } from './image';
import type { ScanMode } from './scan';
import { decodePhotoBarcode, readScans } from './scanReads';
import {
  MAX_SESSION_SCANS,
  dispatchScanSession,
  getScanSession,
} from './scanSession';

/** Gallery photos still being resized: they will join the Scan Session, so they count against its limit. */
let resizing = 0;

/** How many imported photos are still being resized. */
export const resizingImports = () => resizing;

export type ImportOptions = {
  /** The Scan Mode every file is read in (see `scanModeOf` for a camera mode). */
  mode: ScanMode;
  /** What the Scans are read in; Plate has none, so it is dropped for a Plate Scan. */
  scanLanguage: ScanLanguage;
  /** The UI language, for the read. */
  uiLanguage: string;
  /** Some files did not fit under the Scan Session's limit and were left out. */
  onFull: () => void;
  /** A file could not be prepared. */
  onInvalid: () => void;
};

/**
 * Photos from a file picker (the camera's Import, Review's Add from photos): one Scan per file at the
 * end of the Scan Session, read in the background. A receipt waits to be cropped in Review; the rest
 * are resized and read. Files over the Scan Session's limit are left out and reported once.
 */
export function importPhotos(
  picked: File[],
  { mode, scanLanguage, uiLanguage, onFull, onInvalid }: ImportOptions,
): void {
  const room = Math.max(
    0,
    MAX_SESSION_SCANS - getScanSession().scans.length - resizing,
  );
  if (picked.length > room) onFull();
  const base = {
    mode,
    scanLanguage: mode === 'plate' ? undefined : scanLanguage,
  };
  for (const file of picked.slice(0, room)) {
    const id = crypto.randomUUID();
    if (mode === 'receipt') {
      // Cropped from its card in Review, then read.
      dispatchScanSession({
        type: 'enqueue',
        scan: {
          ...base,
          id,
          image: '',
          thumbnail: URL.createObjectURL(file),
          source: file,
        },
      });
      continue;
    }
    resizing += 1;
    void resizeImage(file)
      .then(
        (image) => {
          dispatchScanSession({
            type: 'enqueue',
            scan: { ...base, id, image, thumbnail: image },
          });
          readScans(uiLanguage);
          if (mode === 'product')
            decodePhotoBarcode(id, file, (photo) => readBarcode(photo));
        },
        () => onInvalid(),
      )
      .finally(() => {
        resizing -= 1;
      });
  }
}
