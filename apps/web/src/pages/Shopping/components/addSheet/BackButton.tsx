import { BackIcon, Box, tokens, insetFocusRing } from '@pocket-pantry/ui';

export type BackButtonProps = {
  /** Where it goes, e.g. "All templates". */
  label: string;
  onClick: () => void;
  /** Space under it, in theme spacing units. */
  mb?: number;
};

/** The accent text button with a back arrow that tops the Templates sub-views. */
export function BackButton({ label, onClick, mb }: BackButtonProps) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        mr: 'auto',
        mb,
        p: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        border: 0,
        background: 'none',
        color: tokens.color.accent,
        font: 'inherit',
        fontSize: 14,
        fontWeight: 700,
        cursor: 'pointer',
        ...insetFocusRing,
      }}
    >
      <BackIcon size={16} aria-hidden />
      {label}
    </Box>
  );
}
