import { resizeImage } from './image';
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
  receipt: resizeOnly,
  plate: resizeOnly,
  ingredients: resizeOnly,
};
