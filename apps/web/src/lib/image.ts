/** Longest edge sent to the API. Plenty for reading a label, small enough for a phone connection. */
export const MAX_IMAGE_EDGE = 1600;
const JPEG_QUALITY = 0.8;

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
