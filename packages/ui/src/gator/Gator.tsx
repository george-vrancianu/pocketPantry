import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '../theme/usePrefersReducedMotion';
import { type AnimatedGatorMood, gatorLayout } from './gatorGeometry';

export type GatorLoop = 'idle' | 'signature';
/** Everything the image can show; `data-motion` carries it. */
export type GatorMotion = GatorLoop | 'entrance';

/** How long each one-shot plays before Gator returns to its loop (ms). */
export const ONE_SHOT_MS = { entrance: 1300 } as const;
type OneShot = keyof typeof ONE_SHOT_MS;

type Variant = GatorMotion | 'tap';
const VARIANT_FILE = /gator-(.+)-(idle|signature|entrance|tap)\.svg$/;

const FILES = import.meta.glob<string>(
  './art/gator-*-{idle,signature,entrance,tap}.svg',
  { query: '?url', import: 'default', eager: true },
);

const ART: Record<string, Partial<Record<Variant, string>>> = {};
for (const [path, url] of Object.entries(FILES)) {
  const [, mood, variant] = VARIANT_FILE.exec(path)!;
  (ART[mood!] ??= {})[variant as Variant] = url;
}

export type GatorProps = {
  mood: AnimatedGatorMood;
  /** Pixel width of the drawing itself; its padding hangs outside. */
  size?: number;
  /** The resting loop: breathing and blinking, or the pose's own action. */
  loop?: GatorLoop;
  /** Play the Entrance on mount (default true). */
  entrance?: boolean;
} & (
  | {
      /** The translated alt text describing the mood. */
      alt: string;
      decorative?: false;
    }
  | {
      /** Empty alt, hidden from assistive tech. */
      decorative: true;
      alt?: never;
    }
);

/** A one-shot in progress. */
type Shot = { kind: OneShot };

/**
 * Gator in motion: an Entrance on mount, then the caller's loop. The motion
 * lives in the SVG files; this only picks the file. Animations in an `<img>`
 * don't fire `animationend`, so a timer ends each one-shot.
 */
export function Gator({
  mood,
  size = 96,
  loop = 'idle',
  entrance = true,
  alt,
  decorative,
}: GatorProps) {
  const reduceMotion = usePrefersReducedMotion();
  const [shot, setShot] = useState<Shot | null>(() =>
    entrance && !reduceMotion ? { kind: 'entrance' } : null,
  );
  const [shotMood, setShotMood] = useState(mood);
  if (shotMood !== mood) {
    // A one-shot belongs to the mood it started on: a new mood goes straight
    // to its loop, and the cut-short one-shot never comes back.
    setShotMood(mood);
    setShot(null);
  }

  useEffect(() => {
    if (!shot) return;
    const id = setTimeout(() => setShot(null), ONE_SHOT_MS[shot.kind]);
    return () => clearTimeout(id);
  }, [shot]);

  // With reduced motion there are no one-shots at all.
  const active = !reduceMotion && shot ? shot.kind : null;
  const motion: GatorMotion = active ?? loop;
  const files = ART[mood]!;
  const layout = gatorLayout(mood, size);
  const loopSrc = files[loop]!;

  // Warm the cache with the loop while the one-shot plays, so the swap
  // doesn't show an empty box.
  useEffect(() => {
    new Image().src = loopSrc;
  }, [loopSrc]);

  return (
    <span
      style={{
        // flow-root: the img's negative margin-top must not collapse out of
        // the span, or the art and the content after it shift up.
        display: 'flow-root',
        width: layout.box.width,
        height: layout.box.height,
      }}
    >
      <img
        src={files[motion]}
        data-mood={mood}
        data-motion={motion}
        alt={decorative ? '' : alt}
        aria-hidden={decorative ? true : undefined}
        width={Math.round(layout.width)}
        style={{
          display: 'block',
          maxWidth: 'none',
          overflow: 'visible',
          width: layout.width,
          height: layout.height,
          marginTop: layout.marginTop,
          marginLeft: layout.marginLeft,
          marginRight: layout.marginRight,
          marginBottom: layout.marginBottom,
        }}
        draggable={false}
      />
    </span>
  );
}
