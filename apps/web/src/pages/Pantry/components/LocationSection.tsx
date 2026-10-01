import { Box, Typography, tokens } from '@pocket-pantry/ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { StorageLocation } from '../../../lib/catalog';
import type { RollUp } from '../../../lib/pantry';
import { RollUpRow } from './RollUpRow';

type Props = {
  location: StorageLocation;
  /** Number of Batches (not rows) in this Location. */
  batchCount: number;
  rows: RollUp[];
  today: Date;
};

export function LocationSection({ location, batchCount, rows, today }: Props) {
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
        {`${t(`locations.${location}`)} · ${batchCount}`}
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
        {rows.map((row) => (
          <RollUpRow key={row.key} rollUp={row} today={today} />
        ))}
      </Box>
    </Box>
  );
}
