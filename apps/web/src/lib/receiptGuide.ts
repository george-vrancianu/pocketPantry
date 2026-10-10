// Receipt camera guide constants, kept apart from the canvas code in image.ts so the
// viewfinder can use them without pulling in image processing.

// OpenAI bills image input per 512 x 512 tile (at detail "high"), after its own scaling.
// A receipt is a tall, narrow strip, so it is cropped to a 1:3 guide and sent one tile wide
// and three tiles tall: 512 x 1536 = 3 tiles, with no mostly-empty second column.
// Change RECEIPT_OUTPUT_WIDTH (e.g. to 768) to trade tokens for accuracy; height follows.
export const OPENAI_TILE_EDGE = 512;
export const RECEIPT_TILES_DOWN = 3;
export const RECEIPT_OUTPUT_WIDTH = OPENAI_TILE_EDGE;
/** Guide width / height. One tile wide by three tall. */
export const RECEIPT_GUIDE_ASPECT = 1 / RECEIPT_TILES_DOWN;
