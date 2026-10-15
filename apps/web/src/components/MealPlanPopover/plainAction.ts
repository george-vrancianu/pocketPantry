import { tokens } from '@pocket-pantry/ui';

/**
 * The look of "Plan your week", "Plan a meal", "Start a plan" and "Edit day": plain muted text, not a button,
 * as the pages they would open do not exist yet.
 */
export const plainAction = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  fontSize: 12.5,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  color: tokens.color.muted,
} as const;
