import { Box, Typography, tokens } from '@pocket-pantry/ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { StorageLocation } from '../../../lib/catalog';
import type { Batch } from '../../../lib/pantry';
import { BatchRow } from './BatchRow';

type Props = { location: StorageLocation; batches: Batch[]; today: Date };

export function LocationSection({ location, batches, today }: Props) {
  const { t } = useTranslation('pantry');
  const headingId = useId();
  return (
    <Box component="section" aria-labelledby={headingId} sx={{ mb: 2 }}>
      <Typography
        id={headingId}
        variant="sectionLabel"
        component="h2"
        color="text.secondary"
        sx={{ display: 'block', mx: '4px', mb: 1 }}
      >
        {`${t(`locations.${location}`)} · ${batches.length}`}
      </Typography>
      <Box
        component="ul"
        sx={{
          listStyle: 'none',
          m: 0,
          py: 0,
          px: '14px',
          bgcolor: tokens.color.surface,
          border: `1px solid ${tokens.color.line}`,
          borderRadius: `${tokens.radius.card}px`,
          overflow: 'hidden',
        }}
      >
        {batches.map((batch) => (
          <BatchRow key={batch.id} batch={batch} today={today} />
        ))}
      </Box>
    </Box>
  );
}
