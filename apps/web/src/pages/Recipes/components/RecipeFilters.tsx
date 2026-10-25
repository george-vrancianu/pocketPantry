import {
  Box,
  Chip,
  CloseIcon,
  InputAdornment,
  SearchIcon,
  TextField,
  tokens,
  color,
  radius,
} from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import {
  isFiltering,
  type RecipeBrowse,
  type RecipeFilterOptions,
} from '../../../lib/recipes';
import { bleedSx } from './bleed';

type Props = {
  value: RecipeBrowse;
  onChange: (next: RecipeBrowse) => void;
  options: RecipeFilterOptions | undefined;
  /** The search box's label, when not "Search Recipes" (Explore searches all of them). */
  searchLabel?: string;
};

const NONE: RecipeBrowse = { search: '', cuisineId: '', methodId: '' };

/** The search box and the Cuisine and Method chips, pinned to the top while the list scrolls. */
export function RecipeFilters({
  value,
  onChange,
  options,
  searchLabel,
}: Props) {
  const { t } = useTranslation('recipes');
  const cuisines = options?.cuisines ?? [];
  const methods = options?.methods ?? [];
  const toggle = (key: 'cuisineId' | 'methodId', id: string) =>
    onChange({ ...value, [key]: value[key] === id ? '' : id });
  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 2,
        bgcolor: tokens.color.bg,
        mx: bleedSx.mx,
        px: bleedSx.px,
        py: '8px',
      }}
    >
      <TextField
        type="search"
        label={searchLabel ?? t('search')}
        value={value.search}
        slotProps={{
          htmlInput: { maxLength: 100 },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon size={18} />
              </InputAdornment>
            ),
          },
        }}
        onChange={(event) => onChange({ ...value, search: event.target.value })}
        sx={{ bgcolor: color.fieldBg, borderRadius: radius.control }}
      />
      <Box
        role="group"
        aria-label={t('filters')}
        sx={{
          ...bleedSx,
          mt: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
        }}
      >
        {isFiltering(value) ? (
          <Chip
            icon={<CloseIcon size={14} />}
            label={t('clear')}
            onClick={() => onChange(NONE)}
          />
        ) : null}
        {cuisines.map((cuisine) => (
          <Chip
            key={cuisine.id}
            selected={value.cuisineId === cuisine.id}
            onClick={() => toggle('cuisineId', cuisine.id)}
            label={cuisine.name}
          />
        ))}
        {cuisines.length > 0 && methods.length > 0 ? (
          <Box
            aria-hidden
            sx={{
              flexShrink: 0,
              width: '1px',
              height: 20,
              bgcolor: tokens.color.line,
            }}
          />
        ) : null}
        {methods.map((method) => (
          <Chip
            key={method.id}
            selected={value.methodId === method.id}
            onClick={() => toggle('methodId', method.id)}
            label={method.name}
          />
        ))}
      </Box>
    </Box>
  );
}
