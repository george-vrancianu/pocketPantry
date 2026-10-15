import { palette, tokens } from '@pocket-pantry/ui';
import type { Verdict } from '../../lib/health';

/** Ring and bar colour of a verdict. The same thresholds colour each Health Factor's bar segment. */
export const VERDICT_COLOR: Record<Verdict, string> = {
  good: tokens.color.accent,
  some: palette('pp-star'),
  attention: tokens.color.urgentFg,
};

/** How long the ring and the number take to move to a new score, ms. */
export const SCORE_ANIMATION_MS = 700;
export const SCORE_EASING = 'cubic-bezier(.2,.8,.2,1)';
