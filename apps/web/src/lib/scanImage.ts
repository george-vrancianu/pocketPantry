import { cropToReceiptGuide, resizeImage } from './image';
import type { ScanMode } from './scan';

/** Where the image came from: a live camera frame, or a file the Member picked from their gallery. */
export type ImageOrigin = 'camera' | 'gallery';

/** Turns a camera frame or gallery file into the JPEG data URL a Scan Mode sends to its endpoint. */
export type ImagePreparation = (
  source: Blob,
  origin: ImageOrigin,
) => Promise<string>;

const resizeOnly: ImagePreparation = (source) => resizeImage(source);

/** How each Scan Mode prepares its image before sending it. */
export const IMAGE_PREPARATION: Record<ScanMode, ImagePreparation> = {
  product: resizeOnly,
  // A camera frame is cropped to the viewfinder's guide. A gallery file is cropped by the
  // Member in the crop step instead, so it never comes through here: callers must check
  // needsCropStep first and use cropToReceiptArea. Rejecting is deliberate, not a TODO.
  receipt: (source, origin) =>
    origin === 'camera'
      ? cropToReceiptGuide(source)
      : Promise.reject(new Error('gallery receipts go through the crop step')),
  plate: resizeOnly,
  ingredients: resizeOnly,
};

/** Whether a photo must go through the Member's crop step before it is prepared and sent. */
export function needsCropStep(mode: ScanMode, origin: ImageOrigin): boolean {
  return mode === 'receipt' && origin === 'gallery';
}
