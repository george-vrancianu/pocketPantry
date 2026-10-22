// Merge into packages/ui/src/atoms/icons.tsx — Scan screen v3 handoff (2026-10-22).
// Add only the ones the file doesn't export yet. Add the names to the existing `lucide-react` import:
//
//   import { …, Camera, Globe, Image, ImagePlus, Info, Zap } from 'lucide-react';

/** Top bar: torch button (outline when off, filled cam-warn when on). */
export const ZapIcon = lucide(Zap);
/** Top bar: Scan Language chip, 13 pt before the code. */
export const GlobeIcon = lucide(Globe);
/** Top bar: Info button. */
export const InfoIcon = lucide(Info);
/** Footer: Import button (the green "+" badge is a separate PlusIcon, see handoff §5.4). */
export const ImageIcon = lucide(Image);
/** Review overview: "Add from photos". */
export const ImagePlusIcon = lucide(ImagePlus);
/** Review overview: "Take more" (the prototype draws a camera with a plus inside; lucide Camera is fine). */
export const CameraIcon = lucide(Camera);

// Also add the names to the icon list in icons.test.tsx so the render test covers them.
