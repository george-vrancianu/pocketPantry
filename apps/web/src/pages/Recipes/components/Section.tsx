import { Typography } from '@pocket-pantry/ui';
import { useId, type ReactNode } from 'react';

/** A titled block of the detail page. */
export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId}>
      <Typography variant="sectionLabel" component="h2" id={headingId}>
        {title}
      </Typography>
      {children}
    </section>
  );
}
