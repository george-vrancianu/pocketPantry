import type { ComponentType, SVGProps } from 'react';
import {
  House,
  LayoutGrid,
  LogOut,
  Image,
  Pencil,
  Zap,
  Clock,
  Leaf,
  Wallet,
  Apple,
  ChevronUp,
  GripVertical,
  TriangleAlert,
  CircleAlert,
  CircleCheck,
  ArrowLeft,
  ArrowLeftRight,
  Users,
  GitBranch,
  BatteryLow,
  type LucideProps,
} from 'lucide-react';

type IconNode = readonly (readonly [
  'path' | 'circle' | 'rect',
  Readonly<Record<string, string>>,
])[];

/**
 * The Themes & icons handoff set (docs/handoffs/themes, `icons.tsx`): 24 px grid, 2 px stroke,
 * round caps and joins, `currentColor`; no fill except `star-fill` and the dots of `more`.
 * Same shapes as the handoff's `ICON_PATHS`, held as elements rather than markup strings.
 */
const ICON_NODES = {
  plus: [['path', { d: 'M12 5v14M5 12h14' }]],
  minus: [['path', { d: 'M5 12h14' }]],
  copy: [
    ['rect', { x: '8', y: '8', width: '12', height: '12', rx: '2' }],
    ['path', { d: 'M16 8V4H4v12h4' }],
  ],
  logout: [
    ['path', { d: 'M14 4h5v16h-5' }],
    ['path', { d: 'M10 8l-4 4 4 4M6 12h10' }],
  ],
  user: [
    ['circle', { cx: '12', cy: '8', r: '4' }],
    ['path', { d: 'M4.5 21a7.5 7.5 0 0 1 15 0' }],
  ],
  phone: [
    ['rect', { x: '6', y: '2.5', width: '12', height: '19', rx: '2.5' }],
    ['path', { d: 'M11 18.5h2' }],
  ],
  close: [['path', { d: 'M6 6l12 12M18 6L6 18' }]],
  check: [['path', { d: 'M5 12l5 5 9-10' }]],
  search: [
    ['circle', { cx: '11', cy: '11', r: '7' }],
    ['path', { d: 'M20 20l-3.5-3.5' }],
  ],
  'chevron-down': [['path', { d: 'M6 9l6 6 6-6' }]],
  'chevron-right': [['path', { d: 'M9 6l6 6-6 6' }]],
  'chevron-left': [['path', { d: 'M15 6l-6 6 6 6' }]],
  star: [
    [
      'path',
      {
        d: 'M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z',
      },
    ],
  ],
  'star-fill': [
    [
      'path',
      {
        fill: 'currentColor',
        stroke: 'none',
        d: 'M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z',
      },
    ],
  ],
  bookmark: [['path', { d: 'M6 3h12v18l-6-4-6 4z' }]],
  basket: [
    ['path', { d: 'M4 10h16l-1.5 9h-13z' }],
    ['path', { d: 'M8 10V7a4 4 0 0 1 8 0v3' }],
  ],
  pantry: [
    ['path', { d: 'M4 7h16v13H4z' }],
    ['path', { d: 'M4 12h16M9 7V4h6v3' }],
  ],
  recipes: [
    ['path', { d: 'M5 4h14v16H5z' }],
    ['path', { d: 'M8 9h8M8 13h8M8 17h5' }],
  ],
  scan: [
    ['path', { d: 'M4 8V5h3M20 8V5h-3M4 16v3h3M20 16v3h-3' }],
    ['path', { d: 'M8 12h8' }],
  ],
  info: [
    ['circle', { cx: '12', cy: '12', r: '9' }],
    ['path', { d: 'M12 11v5M12 8h.01' }],
  ],
  trash: [['path', { d: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13' }]],
  more: [
    ['circle', { cx: '5', cy: '12', r: '1.3', fill: 'currentColor' }],
    ['circle', { cx: '12', cy: '12', r: '1.3', fill: 'currentColor' }],
    ['circle', { cx: '19', cy: '12', r: '1.3', fill: 'currentColor' }],
  ],
  sliders: [
    ['path', { d: 'M4 7h9M19 7h1M4 17h3M13 17h7' }],
    ['circle', { cx: '16', cy: '7', r: '2.5' }],
    ['circle', { cx: '10', cy: '17', r: '2.5' }],
  ],
  template: [
    ['path', { d: 'M4 5h16v14H4z' }],
    ['path', { d: 'M4 10h16M10 10v9' }],
  ],
  undo: [
    ['path', { d: 'M4 10h11a5 5 0 0 1 0 10h-3' }],
    ['path', { d: 'M8 6l-4 4 4 4' }],
  ],
  /** Not in the handoff set: the expiry handoff's calendar, drawn on the same grid. */
  calendar: [
    ['rect', { x: '3', y: '5', width: '18', height: '16', rx: '3' }],
    ['path', { d: 'M3 10h18M8 3v4M16 3v4' }],
  ],
  /** Not in the handoff set: the Pantry batches handoff's battery-low, the Running low flag. */
  'battery-low': [
    ['rect', { x: '2.5', y: '7', width: '17', height: '10', rx: '2.5' }],
    ['path', { d: 'M22 10.5v3' }],
    ['path', { d: 'M6.5 10.5v3', strokeWidth: '3.2' }],
  ],
  /** Not in the handoff set: a tree elbow that marks a row as belonging to the one above. */
  'sub-item': [['path', { d: 'M6 3v8a5 5 0 0 0 5 5h9' }]],
} as const satisfies Record<string, IconNode>;

export type IconName = keyof typeof ICON_NODES;

export type IconProps = Omit<SVGProps<SVGSVGElement>, 'ref' | 'name'> & {
  size?: number | string;
  /** Gives the icon an accessible name; without one it is decorative and hidden. */
  title?: string;
};

/** 22 px suits the four-tab dock; other sizes are passed at the call site. */
const DEFAULT_SIZE = 22;

function accessibility(title: string | undefined) {
  return title
    ? ({ role: 'img' } as const)
    : ({ 'aria-hidden': true, focusable: 'false' } as const);
}

export function Icon({
  name,
  size = DEFAULT_SIZE,
  title,
  ...rest
}: IconProps & { name: IconName }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...accessibility(title)}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {ICON_NODES[name].map(([Tag, attrs], i) => (
        <Tag key={i} {...attrs} />
      ))}
    </svg>
  );
}

function handoff(name: IconName) {
  return function PocketPantryIcon(props: IconProps) {
    return <Icon name={name} {...props} />;
  };
}

/** No handoff equivalent yet: a lucide glyph with the set's defaults, until the designer draws one. */
function lucide(Glyph: ComponentType<LucideProps>) {
  return function PocketPantryIcon({
    size = DEFAULT_SIZE,
    title,
    ...rest
  }: IconProps) {
    return (
      <Glyph
        size={size}
        strokeWidth={2}
        {...accessibility(title)}
        {...(rest as LucideProps)}
      >
        {title ? <title>{title}</title> : null}
      </Glyph>
    );
  };
}

export const PlusIcon = handoff('plus');
export const MinusIcon = handoff('minus');
export const CopyIcon = handoff('copy');
export const LogoutIcon = handoff('logout');
export const UserIcon = handoff('user');
export const PhoneIcon = handoff('phone');
export const CloseIcon = handoff('close');
export const CheckIcon = handoff('check');
export const SearchIcon = handoff('search');
export const ChevronDownIcon = handoff('chevron-down');
export const ChevronRightIcon = handoff('chevron-right');
export const BackIcon = handoff('chevron-left');
export const StarIcon = handoff('star');
export const StarFillIcon = handoff('star-fill');
export const BookmarkIcon = handoff('bookmark');
export const ShoppingIcon = handoff('basket');
export const PantryIcon = handoff('pantry');
export const RecipesIcon = handoff('recipes');
export const ScanIcon = handoff('scan');
export const InfoIcon = handoff('info');
export const DeleteIcon = handoff('trash');
export const MoreIcon = handoff('more');
export const SettingsIcon = handoff('sliders');
export const TemplateIcon = handoff('template');
export const UndoIcon = handoff('undo');
export const CalendarIcon = handoff('calendar');
export const BatteryLowIcon = handoff('battery-low');
export const SubItemIcon = handoff('sub-item');

export const HomeIcon = lucide(House);
export const CustomiseIcon = lucide(LayoutGrid);
export const SignOutIcon = lucide(LogOut);
export const GalleryIcon = lucide(Image);
export const ManualEntryIcon = lucide(Pencil);
export const FlashIcon = lucide(Zap);
export const ClockIcon = lucide(Clock);
export const IngredientsScanIcon = lucide(Leaf);
export const BudgetIcon = lucide(Wallet);
export const NutritionIcon = lucide(Apple);
export const ChevronUpIcon = lucide(ChevronUp);
export const GripIcon = lucide(GripVertical);
export const WarningIcon = lucide(TriangleAlert);
export const AlertIcon = lucide(CircleAlert);
export const CheckCircleIcon = lucide(CircleCheck);
export const ArrowLeftIcon = lucide(ArrowLeft);
export const SwapIcon = lucide(ArrowLeftRight);
export const PeopleIcon = lucide(Users);
export const BranchIcon = lucide(GitBranch);
export const RunningLowIcon = lucide(BatteryLow);
