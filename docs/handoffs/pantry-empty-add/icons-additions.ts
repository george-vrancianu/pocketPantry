// Merge into packages/ui/src/atoms/icons.tsx — Empty Pantry + Add to Pantry handoff (2026-10-24).
// Add only the ones the file doesn't export yet. Add the names to the existing `lucide-react` import:
//
//   import { …, Camera, Mic, Pencil, Receipt, Refrigerator, ScanBarcode, Snowflake, CalendarDays, Package } from 'lucide-react';

/** Add sheet quick row: "Scan barcode"; camera result card. */
export const ScanBarcodeIcon = lucide(ScanBarcode);
/** Add sheet quick row: "Take a photo"; "From photo" tag (11 px). */
export const CameraIcon = lucide(Camera);
/** Banner pill and quick row: "Say it". */
export const MicIcon = lucide(Mic);
/** Banner pill: "Type". */
export const PencilIcon = lucide(Pencil);
/** Banner pill: "Scan" (receipt). */
export const ReceiptIcon = lucide(Receipt);
/** Location: Fridge (shelf card 24 px, Where it goes 20 px). */
export const FridgeIcon = lucide(Refrigerator);
/** Location: Freezer. */
export const FreezerIcon = lucide(Snowflake);
/** Expires: resolved-date line and the calendar chip. */
export const CalendarDaysIcon = lucide(CalendarDays);
/** Camera: "Adds to your Pantry" pill. */
export const PackageIcon = lucide(Package);

// Two Location icons have no good lucide match. Draw them as custom icons, the same way the
// other custom icons in icons.tsx are defined (24 × 24 viewBox, 2 px stroke, round caps/joins,
// no fill). Paths are the ones used in the prototype:

/** Location: Cupboard (two doors with handles). */
export const CUPBOARD_PATHS = [
  'M3.5 5.5a1.5 1.5 0 0 1 1.5-1.5h14a1.5 1.5 0 0 1 1.5 1.5v13a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5z',
  'M12 4v16',
  'M9.5 11v2M14.5 11v2',
];

/** Location: Spices (jar with lid and label lines). */
export const SPICE_JAR_PATHS = [
  'M8 3.5h8v3H8z',
  'M7 6.5h10v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z',
  'M10 11h4M10 14h4',
];

// Also add the names to the icon list in icons.test.tsx so the render test covers them.
