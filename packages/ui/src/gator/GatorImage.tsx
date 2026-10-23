import shoppingBuddy from './art/gator-shopping-buddy.svg';
import appIcon from './art/gator-app-icon.svg';
import talking from './art/gator-talking.svg';
import happy from './art/gator-happy.svg';
import proud from './art/gator-proud.svg';
import listening from './art/gator-listening.svg';
import thinking from './art/gator-thinking.svg';
import listKeeper from './art/gator-list-keeper.svg';
import worried from './art/gator-worried.svg';
import healthCurious from './art/gator-health-curious.svg';
import healthDapper from './art/gator-health-dapper.svg';
import healthHmm from './art/gator-health-hmm.svg';
import chef from './art/gator-chef.svg';

/**
 * The art lives in `.svg` files (ticket 493), not inline TSX: it is fixed
 * illustration colour, not Theme colour, and the Theme sweep scans only
 * `.ts`/`.tsx`. The dapper file carries its own one-shot glint animation and
 * its reduced-motion rule, so they travel with the image wherever it renders.
 */
const ART = {
  'shopping-buddy': shoppingBuddy,
  'app-icon': appIcon,
  talking,
  happy,
  proud,
  listening,
  thinking,
  'list-keeper': listKeeper,
  worried,
  'health-curious': healthCurious,
  'health-dapper': healthDapper,
  'health-hmm': healthHmm,
  chef,
} as const;

export type GatorMood = keyof typeof ART;

/** Every Gator mood, in the order the handoff lists them. */
export const GATOR_MOODS = Object.keys(ART) as readonly GatorMood[];

export type GatorImageProps = {
  mood: GatorMood;
  /** Pixel width; the height follows the art's own proportions. */
  size?: number;
} & (
  | {
      /**
       * The alt text. The UI package has no i18n, so the caller passes a
       * translated text describing the mood.
       */
      alt: string;
      decorative?: false;
    }
  | {
      /** Empty alt, hidden from assistive tech: the text beside it already says it. */
      decorative: true;
      alt?: never;
    }
);

/** The Gator drawn in one of its moods. */
export function GatorImage({
  mood,
  size = 96,
  alt,
  decorative,
}: GatorImageProps) {
  return (
    <img
      src={ART[mood]}
      alt={decorative ? '' : alt}
      aria-hidden={decorative ? true : undefined}
      width={size}
      style={{ width: size, height: 'auto', display: 'block' }}
      draggable={false}
    />
  );
}
