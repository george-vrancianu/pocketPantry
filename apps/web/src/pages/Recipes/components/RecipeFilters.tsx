import {
  Box,
  CloseIcon,
  InputAdornment,
  SearchIcon,
  TextField,
  tokens,
} from '@pocket-pantry/ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  isFiltering,
  type RecipeBrowse,
  type RecipeFilterOptions,
} from '../../../lib/recipes';
import { bleedSx } from './bleed';
import { border, colour, radius } from '../../../lib/themeVars';

type Props = {
  value: RecipeBrowse;
  onChange: (next: RecipeBrowse) => void;
  options: RecipeFilterOptions | undefined;
};

const NONE: RecipeBrowse = { search: '', cuisineId: '', methodId: '' };

/** The search box and the Cuisine and Method chips, pinned to the top while the list scrolls. */
export function RecipeFilters({ value, onChange, options }: Props) {
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
        label={t('search')}
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
        sx={{ bgcolor: colour.fieldBg, borderRadius: radius.control }}
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
          <Chip onClick={() => onChange(NONE)}>
            <CloseIcon size={14} />
            {t('clear')}
          </Chip>
        ) : null}
        {cuisines.map((cuisine) => (
          <Chip
            key={cuisine.id}
            active={value.cuisineId === cuisine.id}
            onClick={() => toggle('cuisineId', cuisine.id)}
          >
            {cuisine.name}
          </Chip>
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
            active={value.methodId === method.id}
            onClick={() => toggle('methodId', method.id)}
          >
            {method.name}
          </Chip>
        ))}
      </Box>
    </Box>
  );
}

function Chip(props: {
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  const { active } = props;
  return (
    <Box
      component="button"
      type="button"
      aria-pressed={active}
      onClick={props.onClick}
      sx={{
        flexShrink: 0,
        height: 32,
        px: '12px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        borderRadius: radius.chip,
        border: `${border.width} solid ${active ? tokens.color.accentTint : tokens.color.line}`,
        bgcolor: active ? tokens.color.accentTint : tokens.color.surface,
        color: active ? colour.accentOnTint : tokens.color.ink,
        font: 'inherit',
        fontSize: 12.5,
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      {props.children}
    </Box>
  );
}
