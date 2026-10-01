import {
  RECEIPT_GUIDE_ASPECT,
  RECEIPT_GUIDE_HEIGHT_FRACTION,
  RECEIPT_OUTPUT_WIDTH,
  RECEIPT_VIEW,
} from './receiptGuide';

/** Longest edge sent to the API. Plenty for reading a label, small enough for a phone connection. */
export const MAX_IMAGE_EDGE = 1600;
const JPEG_QUALITY = 0.8;

export type Rect = { x: number; y: number; width: number; height: number };

/** The size to scale `width` x `height` to so the longest edge is at most `maxEdge`. Never upscales. */
export function fitWithin(
  width: number,
  height: number,
  maxEdge = MAX_IMAGE_EDGE,
): { width: number; height: number } {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/** Resizes a camera frame or gallery file to a JPEG data URL, ready to send to a scan endpoint. */
export async function resizeImage(source: Blob): Promise<string> {
  const bitmap = await createImageBitmap(source);
  try {
    const { width, height } = fitWithin(bitmap.width, bitmap.height);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('canvas unavailable');
    context.drawImage(bitmap, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  } finally {
    bitmap.close();
  }
}

/**
 * The part of a camera frame that sits under the guide. The preview shows the frame with
 * `object-fit: cover` in a `view` box, so a frame of any shape (including a landscape one on
 * a portrait view) is scaled to fill it and the overflow is cut off; the guide is centred in
 * that box and `guideHeightFraction` of its height.
 */
export function guideCropRect(
  frame: { width: number; height: number },
  view: { width: number; height: number },
  guideHeightFraction: number,
  guideAspect = RECEIPT_GUIDE_ASPECT,
): Rect {
  // View pixels per frame pixel under cover scaling.
  const scale = Math.max(view.width / frame.width, view.height / frame.height);
  const visibleX = (frame.width - view.width / scale) / 2;
  const visibleY = (frame.height - view.height / scale) / 2;
  const guideHeight = view.height * guideHeightFraction;
  const guideWidth = guideHeight * guideAspect;
  const x = Math.max(0, visibleX + (view.width - guideWidth) / 2 / scale);
  const y = Math.max(0, visibleY + (view.height - guideHeight) / 2 / scale);
  const width = Math.min(frame.width - x, guideWidth / scale);
  const height = Math.min(frame.height - y, guideHeight / scale);
  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(width),
    height: Math.round(height),
  };
}

/** The size a receipt crop is sent at: `outputWidth` wide at 1:3, but never bigger than the crop itself. */
export function receiptOutputSize(
  cropWidth: number,
  cropHeight: number,
  outputWidth = RECEIPT_OUTPUT_WIDTH,
): { width: number; height: number } {
  // Downscaling lands on exactly the guide aspect: the crop's own rounding must not cost a row.
  if (cropWidth > outputWidth) {
    return {
      width: outputWidth,
      height: Math.round(outputWidth / RECEIPT_GUIDE_ASPECT),
    };
  }
  const scale = Math.min(1, outputWidth / cropWidth);
  return {
    width: Math.max(1, Math.round(cropWidth * scale)),
    height: Math.max(1, Math.round(cropHeight * scale)),
  };
}

/** Crops a receipt camera frame to the viewfinder's guide and scales it to the receipt output size. */
export async function cropToReceiptGuide(frame: Blob): Promise<string> {
  const bitmap = await createImageBitmap(frame);
  try {
    const crop = guideCropRect(
      bitmap,
      RECEIPT_VIEW,
      RECEIPT_GUIDE_HEIGHT_FRACTION,
    );
    const { width, height } = receiptOutputSize(crop.width, crop.height);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('canvas unavailable');
    context.drawImage(
      bitmap,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      width,
      height,
    );
    return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  } finally {
    bitmap.close();
  }
}
