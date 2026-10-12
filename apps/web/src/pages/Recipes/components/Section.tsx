import { Box, Typography, tokens } from '@pocket-pantry/ui';
import { useId, type ReactNode } from 'react';

/** A titled block of the detail page. */
export function Section({
  title,
  card = false,
  children,
}: {
  title: string;
  /** Sets the content in a white card. */
  card?: boolean;
  children: ReactNode;
}) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId}>
      <Typography variant="sectionLabel" component="h2" id={headingId}>
        {title}
      </Typography>
      {card ? (
        <Box
          sx={{
            px: '16px',
            py: '8px',
            bgcolor: tokens.color.surface,
            border: `1px solid ${tokens.color.line}`,
            borderRadius: `${tokens.radius.card}px`,
          }}
        >
          {children}
        </Box>
      ) : (
        children
      )}
    </section>
  );
}
