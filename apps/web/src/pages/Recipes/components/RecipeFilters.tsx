import { Stack, TextField } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import type { RecipeBrowse, RecipeFilterOptions } from '../../../lib/recipes';

type Props = {
  value: RecipeBrowse;
  onChange: (next: RecipeBrowse) => void;
  options: RecipeFilterOptions | undefined;
};

/** The search box and the Cuisine and Method pickers above the list. */
export function RecipeFilters({ value, onChange, options }: Props) {
  const { t } = useTranslation('recipes');
  return (
    <Stack spacing={1.5}>
      <TextField
        type="search"
        label={t('search')}
        value={value.search}
        onChange={(event) => onChange({ ...value, search: event.target.value })}
      />
      <Picker
        label={t('cuisine')}
        any={t('anyCuisine')}
        value={value.cuisineId}
        items={options?.cuisines ?? []}
        onChange={(cuisineId) => onChange({ ...value, cuisineId })}
      />
      <Picker
        label={t('method')}
        any={t('anyMethod')}
        value={value.methodId}
        items={options?.methods ?? []}
        onChange={(methodId) => onChange({ ...value, methodId })}
      />
    </Stack>
  );
}

function Picker(props: {
  label: string;
  any: string;
  value: string;
  items: { id: string; name: string }[];
  onChange: (id: string) => void;
}) {
  return (
    <TextField
      select
      label={props.label}
      value={props.value}
      onChange={(event) => props.onChange(event.target.value)}
      slotProps={{ select: { native: true } }}
    >
      <option value="">{props.any}</option>
      {props.items.map((item) => (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      ))}
    </TextField>
  );
}
