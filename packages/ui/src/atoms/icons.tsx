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
  Minus,
  GripVertical,
  TriangleAlert,
  CircleAlert,
  CircleCheck,
  Trash2,
  ArrowLeftRight,
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
export const SwapIcon = withDefaults(ArrowLeftRight);
