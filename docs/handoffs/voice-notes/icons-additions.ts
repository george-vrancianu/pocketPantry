// Merge into packages/ui/src/atoms/icons.tsx — Voice Notes handoff (2026-10-18).
// Add only the ones the file doesn't export yet. Add the names to the existing `lucide-react` import:
//
//   import { …, Clock, Ear, Equal, Mic, MicOff, Quote, WifiOff } from 'lucide-react';

/** The voice button (Shopping and Pantry), the intro sheet hero, the intro sheet's Allow button. */
export const MicIcon = lucide(Mic);
/** The voice button and blocked sheet when microphone permission is denied. */
export const MicOffIcon = lucide(MicOff);
/** Status pill: "Couldn't send". */
export const WifiOffIcon = lucide(WifiOff);
/** Status pill: "Didn't catch anything, try again". */
export const EarIcon = lucide(Ear);
/** Review: the "What I heard" tile. */
export const QuoteIcon = lucide(Quote);
/** Status pill: Voice Cap reached. */
export const ClockIcon = lucide(Clock);
/** Review: the Set quantity op tile ("Change Eggs"). */
export const EqualIcon = lucide(Equal);

// Also add the names to the icon list in icons.test.tsx so the render test covers them.
