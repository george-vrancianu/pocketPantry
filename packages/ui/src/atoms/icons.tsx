import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';
import {
  Camera,
  Check,
  Plus,
  X,
  Settings,
  House,
  LayoutGrid,
  LogOut,
  ShoppingBag,
  Archive,
  BookOpen,
  Image,
  Pencil,
  Zap,
  Info,
  Clock,
  CircleDot,
  Leaf,
  Receipt,
  ScanBarcode,
  Wallet,
  Apple,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Bookmark,
  LayoutTemplate,
  Search,
  Minus,
  GripVertical,
  TriangleAlert,
  CircleAlert,
  CircleCheck,
  Trash2,
  ArrowLeft,
  ArrowLeftRight,
  Users,
  ChevronLeft,
  Ellipsis,
  GitBranch,
  ShoppingCart,
  createLucideIcon,
} from 'lucide-react';

/** Handoff section 5: 24 px line icons at 1.8 stroke. */
function withDefaults(Icon: ComponentType<LucideProps>) {
  return function PocketPantryIcon(props: LucideProps) {
    return <Icon size={22} strokeWidth={1.8} aria-hidden="true" {...props} />;
  };
}

export const HomeIcon = withDefaults(House);
export const ShoppingIcon = withDefaults(ShoppingBag);
export const PantryIcon = withDefaults(Archive);
export const RecipesIcon = withDefaults(BookOpen);
export const ScanIcon = withDefaults(Camera);
export const CustomiseIcon = withDefaults(LayoutGrid);
export const SignOutIcon = withDefaults(LogOut);
export const CheckIcon = withDefaults(Check);
export const SettingsIcon = withDefaults(Settings);
export const PlusIcon = withDefaults(Plus);
export const CloseIcon = withDefaults(X);
export const GalleryIcon = withDefaults(Image);
export const ManualEntryIcon = withDefaults(Pencil);
export const InfoIcon = withDefaults(Info);
export const FlashIcon = withDefaults(Zap);
export const ClockIcon = withDefaults(Clock);
export const ProductScanIcon = withDefaults(ScanBarcode);
export const ReceiptScanIcon = withDefaults(Receipt);
export const PlateScanIcon = withDefaults(CircleDot);
export const IngredientsScanIcon = withDefaults(Leaf);
export const BudgetIcon = withDefaults(Wallet);
export const NutritionIcon = withDefaults(Apple);
export const ChevronUpIcon = withDefaults(ChevronUp);
export const ChevronDownIcon = withDefaults(ChevronDown);
export const MinusIcon = withDefaults(Minus);
export const GripIcon = withDefaults(GripVertical);
export const WarningIcon = withDefaults(TriangleAlert);
export const AlertIcon = withDefaults(CircleAlert);
export const CheckCircleIcon = withDefaults(CircleCheck);
export const DeleteIcon = withDefaults(Trash2);
export const EditIcon = withDefaults(Pencil);
export const ArrowLeftIcon = withDefaults(ArrowLeft);
export const SwapIcon = withDefaults(ArrowLeftRight);
export const PeopleIcon = withDefaults(Users);
export const BackIcon = withDefaults(ChevronLeft);
export const MoreIcon = withDefaults(Ellipsis);
export const BranchIcon = withDefaults(GitBranch);
export const CartIcon = withDefaults(ShoppingCart);
export const ChevronRightIcon = withDefaults(ChevronRight);
export const SearchIcon = withDefaults(Search);
export const BookmarkIcon = withDefaults(Bookmark);
export const TemplateIcon = withDefaults(LayoutTemplate);

/** The expiry handoff's calendar: an 18 x 16 rounded rect at y 5, a line at y 10, two ticks at x 8 and 16. */
const Calendar = createLucideIcon('pp-calendar', [
  ['rect', { x: '3', y: '5', width: '18', height: '16', rx: '3', key: 'body' }],
  ['path', { d: 'M3 10h18M8 3v4M16 3v4', key: 'lines' }],
]);
export const CalendarIcon = withDefaults(Calendar);
