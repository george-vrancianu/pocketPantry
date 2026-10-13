import { aisleTint } from '../theme/aisleTints';
import ingredientIconMap from './ingredientIconMap.json';
import { DEFAULT_ICON_KEY, INGREDIENT_ICONS } from './ingredientIcons';

const ICON_KEYS: Readonly<Record<string, string>> = ingredientIconMap;

/** Above this size the stroke stays 1.5px instead of growing with the icon. */
const FIXED_STROKE_ABOVE = 48;

export type IngredientIconProps = {
  /** The Ingredient; omit it (an Unmatched name) for the Default Icon. */
  ingredientId?: string | null;
  /** The Ingredient's Aisle, for the tint; omit it for the neutral tint. */
  aisleId?: string | null;
  /** Pixel size of the square icon. */
  size?: number;
};

/**
 * The Ingredient Icon: a bare duotone SVG, its outline in the current text
 * colour and its body filled with the Aisle's light tint. Decorative. The slot
 * it sits in belongs to the caller.
 */
export function IngredientIcon({
  ingredientId,
  aisleId,
  size = 24,
}: IngredientIconProps) {
  const mapped =
    ingredientId && Object.hasOwn(ICON_KEYS, ingredientId)
      ? ICON_KEYS[ingredientId]
      : undefined;
  const key =
    mapped && Object.hasOwn(INGREDIENT_ICONS, mapped)
      ? mapped
      : DEFAULT_ICON_KEY;
  const tint = aisleTint(aisleId).light;
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      data-ingredient-icon={key}
      data-ingredient-tint={tint}
    >
      {INGREDIENT_ICONS[key].parts.map((part, index) => (
        <path
          key={index}
          d={part.d}
          fill={part.body ? tint : part.dot ? 'currentColor' : 'none'}
          vectorEffect={
            size > FIXED_STROKE_ABOVE ? 'non-scaling-stroke' : undefined
          }
        />
      ))}
    </svg>
  );
}
