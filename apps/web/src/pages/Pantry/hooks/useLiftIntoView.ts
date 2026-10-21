import {
  DOCK_BOTTOM,
  DOCK_HEIGHT,
  usePrefersReducedMotion,
} from '@pocket-pantry/ui';
import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { LIFT_MS } from '../components/liftedBlock';

/** The bottom of the viewport the Dock covers (its larger height, so it holds on every width). */
const DOCK_ZONE = DOCK_BOTTOM + DOCK_HEIGHT.md;
/** Room left between the scrolled-in card and the Dock. */
const BREATHING = 14;

/**
 * Once an Ingredient has lifted open, scroll its card up if its bottom is under the Dock: smoothly, or at once
 * under reduce-motion.
 */
export function useLiftIntoView(
  target: RefObject<HTMLElement | null>,
  open: boolean,
) {
  const reduceMotion = usePrefersReducedMotion();
  const reduceMotionNow = useRef(reduceMotion);
  useLayoutEffect(() => {
    reduceMotionNow.current = reduceMotion;
  });
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      const element = target.current;
      if (!element) return;
      const limit = window.innerHeight - DOCK_ZONE;
      const { bottom } = element.getBoundingClientRect();
      if (bottom <= limit) return;
      window.scrollBy({
        top: bottom - limit + BREATHING,
        behavior: reduceMotionNow.current ? 'auto' : 'smooth',
      });
    }, LIFT_MS + 20);
    return () => clearTimeout(timer);
    // Only when the Ingredient opens, not when the motion setting changes while it is open.
  }, [open, target]);
}
