type Frame = Record<string, string | number>;

/**
 * An sx animation that plays `keyframes` (named `name`) as `timing` (duration, easing, delay, fill),
 * and not at all under reduced motion.
 */
export function keyframesSx(
  name: string,
  timing: string,
  keyframes: { from?: Frame; to?: Frame },
) {
  return {
    animation: `${name} ${timing}`,
    [`@keyframes ${name}`]: keyframes,
    '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
  };
}
