import { border, color, radius, shadow, tokens } from '@pocket-pantry/ui';

/** The lift: margin, shadow and corners move together (pantry-batches handoff, variant B). */
export const LIFT_MS = 280;
export const LIFT_EASING = 'cubic-bezier(.2,.8,.2,1)';

type Block = {
  /** This Ingredient is open, so it lifts out of the Location card. */
  open: boolean;
  /** Round the top corners: the first block, or the one just below an open block. */
  roundTop: boolean;
  /** Round the bottom corners: the last block, or the one just above an open block. */
  roundBottom: boolean;
};

/**
 * One Ingredient row as a block of its Location card. The card is a stack of these, so an open one can lift
 * out (10 pt apart, 6 pt wider, float shadow and accent outline) and the blocks either side close it off.
 */
export function liftedBlockSx({ open, roundTop, roundBottom }: Block) {
  const edge = open ? 'transparent' : color.cardLine;
  const top = open || roundTop ? radius.card : 0;
  const bottom = open || roundBottom ? radius.card : 0;
  return {
    position: 'relative',
    zIndex: open ? 2 : 'auto',
    overflow: 'hidden',
    bgcolor: color.cardBg,
    // Longhands: jsdom drops shorthands that hold `var()`.
    borderStyle: 'solid',
    borderLeftWidth: border.width,
    borderRightWidth: border.width,
    borderLeftColor: edge,
    borderRightColor: edge,
    // Inside the card, a divider; on a closed-off edge, the card's own line.
    borderTopWidth: open || roundTop ? border.width : '1px',
    borderTopColor: open ? edge : roundTop ? edge : tokens.color.divider,
    borderBottomWidth: open || roundBottom ? border.width : 0,
    borderBottomColor: edge,
    borderTopLeftRadius: top,
    borderTopRightRadius: top,
    borderBottomRightRadius: bottom,
    borderBottomLeftRadius: bottom,
    boxShadow: open
      ? `${shadow.float}, 0 0 0 1.5px ${tokens.color.accent}`
      : shadow.card,
    marginTop: open ? '10px' : 0,
    marginBottom: open ? '10px' : 0,
    marginLeft: open ? '-6px' : 0,
    marginRight: open ? '-6px' : 0,
    transition: ['margin', 'box-shadow', 'border-radius', 'border-color']
      .map((property) => `${property} ${LIFT_MS}ms ${LIFT_EASING}`)
      .join(', '),
    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
  } as const;
}

/** Where each row of a Location sits in its stack of blocks, given which one (if any) is open. */
export function blockEdges(rows: { open: boolean }[]): Block[] {
  return rows.map((row, index) => ({
    open: row.open,
    roundTop: index === 0 || Boolean(rows[index - 1]?.open),
    roundBottom: index === rows.length - 1 || Boolean(rows[index + 1]?.open),
  }));
}
