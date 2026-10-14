// PocketPantry icon set — generated from the themes prototype. 24 px grid, 2 px stroke, round caps.
// Usage: <Icon name="basket" size={20} /> or <BasketIcon />. Colour comes from currentColor.
import * as React from 'react';

export const ICON_PATHS = {
  'plus': "<path d=\"M12 5v14M5 12h14\"/>",
  'close': "<path d=\"M6 6l12 12M18 6L6 18\"/>",
  'check': "<path d=\"M5 12l5 5 9-10\"/>",
  'search': "<circle cx=\"11\" cy=\"11\" r=\"7\"/><path d=\"M20 20l-3.5-3.5\"/>",
  'chevron-down': "<path d=\"M6 9l6 6 6-6\"/>",
  'chevron-right': "<path d=\"M9 6l6 6-6 6\"/>",
  'chevron-left': "<path d=\"M15 6l-6 6 6 6\"/>",
  'star': "<path d=\"M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z\"/>",
  'star-fill': "<path fill=\"currentColor\" stroke=\"none\" d=\"M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z\"/>",
  'bookmark': "<path d=\"M6 3h12v18l-6-4-6 4z\"/>",
  'basket': "<path d=\"M4 10h16l-1.5 9h-13z\"/><path d=\"M8 10V7a4 4 0 0 1 8 0v3\"/>",
  'pantry': "<path d=\"M4 7h16v13H4z\"/><path d=\"M4 12h16M9 7V4h6v3\"/>",
  'recipes': "<path d=\"M5 4h14v16H5z\"/><path d=\"M8 9h8M8 13h8M8 17h5\"/>",
  'scan': "<path d=\"M4 8V5h3M20 8V5h-3M4 16v3h3M20 16v3h-3\"/><path d=\"M8 12h8\"/>",
  'info': "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 11v5M12 8h.01\"/>",
  'trash': "<path d=\"M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13\"/>",
  'more': "<circle cx=\"5\" cy=\"12\" r=\"1.3\" fill=\"currentColor\"/><circle cx=\"12\" cy=\"12\" r=\"1.3\" fill=\"currentColor\"/><circle cx=\"19\" cy=\"12\" r=\"1.3\" fill=\"currentColor\"/>",
  'sliders': "<path d=\"M4 7h9M19 7h1M4 17h3M13 17h7\"/><circle cx=\"16\" cy=\"7\" r=\"2.5\"/><circle cx=\"10\" cy=\"17\" r=\"2.5\"/>",
  'template': "<path d=\"M4 5h16v14H4z\"/><path d=\"M4 10h16M10 10v9\"/>",
  'undo': "<path d=\"M4 10h11a5 5 0 0 1 0 10h-3\"/><path d=\"M8 6l-4 4 4 4\"/>",
} as const;

export type IconName = keyof typeof ICON_PATHS;

export interface IconProps extends React.SVGProps<SVGSVGElement> { name: IconName; size?: number | string; title?: string }

export function Icon({ name, size = 24, title, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} {...rest}>
      {title ? <title>{title}</title> : null}
      <g dangerouslySetInnerHTML={{ __html: ICON_PATHS[name] }} />
    </svg>
  );
}

export const PlusIcon = (p: Omit<IconProps, 'name'>) => <Icon name="plus" {...p} />;
export const CloseIcon = (p: Omit<IconProps, 'name'>) => <Icon name="close" {...p} />;
export const CheckIcon = (p: Omit<IconProps, 'name'>) => <Icon name="check" {...p} />;
export const SearchIcon = (p: Omit<IconProps, 'name'>) => <Icon name="search" {...p} />;
export const ChevronDownIcon = (p: Omit<IconProps, 'name'>) => <Icon name="chevron-down" {...p} />;
export const ChevronRightIcon = (p: Omit<IconProps, 'name'>) => <Icon name="chevron-right" {...p} />;
export const ChevronLeftIcon = (p: Omit<IconProps, 'name'>) => <Icon name="chevron-left" {...p} />;
export const StarIcon = (p: Omit<IconProps, 'name'>) => <Icon name="star" {...p} />;
export const StarFillIcon = (p: Omit<IconProps, 'name'>) => <Icon name="star-fill" {...p} />;
export const BookmarkIcon = (p: Omit<IconProps, 'name'>) => <Icon name="bookmark" {...p} />;
export const BasketIcon = (p: Omit<IconProps, 'name'>) => <Icon name="basket" {...p} />;
export const PantryIcon = (p: Omit<IconProps, 'name'>) => <Icon name="pantry" {...p} />;
export const RecipesIcon = (p: Omit<IconProps, 'name'>) => <Icon name="recipes" {...p} />;
export const ScanIcon = (p: Omit<IconProps, 'name'>) => <Icon name="scan" {...p} />;
export const InfoIcon = (p: Omit<IconProps, 'name'>) => <Icon name="info" {...p} />;
export const TrashIcon = (p: Omit<IconProps, 'name'>) => <Icon name="trash" {...p} />;
export const MoreIcon = (p: Omit<IconProps, 'name'>) => <Icon name="more" {...p} />;
export const SlidersIcon = (p: Omit<IconProps, 'name'>) => <Icon name="sliders" {...p} />;
export const TemplateIcon = (p: Omit<IconProps, 'name'>) => <Icon name="template" {...p} />;
export const UndoIcon = (p: Omit<IconProps, 'name'>) => <Icon name="undo" {...p} />;
