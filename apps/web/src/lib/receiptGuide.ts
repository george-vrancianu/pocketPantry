// Receipt image size constants, kept apart from the canvas code in image.ts.

// OpenAI bills image input per 512 x 512 tile (at detail "high"), after its own scaling.
// A receipt is a tall, narrow strip: the gallery cropper frames it at 1:3 and sends it one tile
// wide and three tall (512 x 1536 = 3 tiles). The camera crop follows the on-screen guide
// instead and keeps its own aspect, but is capped at the same width.
// Change RECEIPT_OUTPUT_WIDTH (e.g. to 768) to trade tokens for accuracy; height follows.
const OPENAI_TILE_EDGE = 512;
const RECEIPT_TILES_DOWN = 3;
export const RECEIPT_OUTPUT_WIDTH = OPENAI_TILE_EDGE;
/** The gallery cropper's width / height. One tile wide by three tall. */
export const RECEIPT_GUIDE_ASPECT = 1 / RECEIPT_TILES_DOWN;
