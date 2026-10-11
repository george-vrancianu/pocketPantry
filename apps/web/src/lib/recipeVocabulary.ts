// Recipe vocabulary shared by the Admin and member-facing Recipe screens.

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];
export const PAIRING_KINDS = ['food', 'drink'] as const;
export type PairingKind = (typeof PAIRING_KINDS)[number];
export const PAIRING_PRINCIPLES = [
  'acid_cuts_fat',
  'salt_balances_sweet',
  'fat_carries_flavour',
  'contrast_texture',
  'complement_flavour',
  'bitter_balances_rich',
  'cleanses_palate',
  'regional_tradition',
] as const;
export type PairingPrinciple = (typeof PAIRING_PRINCIPLES)[number];
