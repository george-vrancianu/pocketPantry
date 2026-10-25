import { usePrefersReducedMotion } from '@pocket-pantry/ui';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { TAP_BEFORE_NEXT_MS } from './gatorTap';

/**
 * For a link that holds Gator: pressing it plays his Tap, then navigates `TAP_BEFORE_NEXT_MS`
 * later. Pass `taps` to `Gator` as `tapSignal` and `onClick` to the link. A modified or non-left
 * click is left to the browser, and with reduced motion the link navigates at once.
 */
export function useGatorTapLink(to: string | null) {
  const navigate = useNavigate();
  const reduceMotion = usePrefersReducedMotion();
  const [taps, setTaps] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const onClick = (event: MouseEvent<HTMLElement>) => {
    const plain =
      event.button === 0 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey;
    if (!to || reduceMotion || !plain) return;
    event.preventDefault();
    if (timer.current) return;
    setTaps((n) => n + 1);
    timer.current = setTimeout(() => {
      timer.current = undefined;
      navigate(to);
    }, TAP_BEFORE_NEXT_MS);
  };

  return { taps, onClick };
}
