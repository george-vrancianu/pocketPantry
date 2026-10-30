import {
  BackIcon,
  Box,
  CloseIcon,
  IconButton,
  Typography,
} from '@pocket-pantry/ui';
import type { Ref } from 'react';

export type SheetHeaderProps = {
  title: string;
  subtitle?: string;
  /** Given, the title takes focus programmatically (a step change moves focus here). */
  titleRef?: Ref<HTMLHeadingElement>;
  onBack?: () => void;
  onClose: () => void;
  /** Needed only with `onBack`. */
  backLabel?: string;
  closeLabel: string;
  /** `roomy` is the larger title and wider padding of the Family catalog sheets. */
  size?: 'compact' | 'roomy';
};

/** A Settings sheet's header: an optional back button, a title with a context line, and a close button. */
export function SheetHeader({
  title,
  subtitle,
  titleRef,
  onBack,
  onClose,
  backLabel,
  closeLabel,
  size = 'compact',
}: SheetHeaderProps) {
  const roomy = size === 'roomy';
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        ...(roomy ? { px: 3, pt: 2, pb: 1 } : { px: 2, py: 1.5 }),
      }}
    >
      {onBack ? (
        <IconButton label={backLabel ?? ''} size={40} onClick={onBack}>
          <BackIcon size={18} />
        </IconButton>
      ) : null}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          ref={titleRef}
          component="h2"
          variant={roomy ? undefined : 'body1'}
          tabIndex={titleRef ? -1 : undefined}
          sx={
            roomy
              ? {
                  fontSize: 20,
                  fontWeight: 700,
                  overflowWrap: 'anywhere',
                  outline: 'none',
                }
              : { fontWeight: 700, outline: 'none' }
          }
        >
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="meta" color="text.secondary">
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      <IconButton label={closeLabel} size={40} onClick={onClose}>
        <CloseIcon size={18} />
      </IconButton>
    </Box>
  );
}
