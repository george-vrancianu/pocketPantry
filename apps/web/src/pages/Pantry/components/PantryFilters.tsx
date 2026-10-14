import { Box, Chip, Stack, TextField } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { FILTERS, type PantryFilter } from '../../../lib/pantry';

type Props = {
  query: string;
  onQueryChange: (query: string) => void;
  filter: PantryFilter;
  onFilterChange: (filter: PantryFilter) => void;
  counts: Record<PantryFilter, number>;
};

/** Search box and the All / Fridge / Freezer / Cupboard / Spices chips with live counts. */
export function PantryFilters({
  query,
  onQueryChange,
  filter,
  onFilterChange,
  counts,
}: Props) {
  const { t } = useTranslation('pantry');
  return (
    <Stack spacing={1}>
      <TextField
        type="search"
        label={t('search.label')}
        placeholder={t('search.placeholder')}
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />
      <Box
        role="group"
        aria-label={t('filters')}
        sx={{ display: 'flex', gap: '8px', overflowX: 'auto', pb: '4px' }}
      >
        {FILTERS.map((chip) => {
          const active = chip === filter;
          return (
            <Chip
              key={chip}
              selected={active}
              onClick={() => onFilterChange(chip)}
              label={`${chip === 'all' ? t('all') : t(`common:locations.${chip}`)} · ${counts[chip]}`}
            />
          );
        })}
      </Box>
    </Stack>
  );
}
