import { Button, Stack, TextField, Typography } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { localName, type AdminIngredient } from '../../../lib/admin';

type Props = {
  ingredients: AdminIngredient[];
  filter: string;
  onFilterChange: (filter: string) => void;
  onCreate: () => void;
  onEdit: (id: string) => void;
};

export function IngredientList({
  ingredients,
  filter,
  onFilterChange,
  onCreate,
  onEdit,
}: Props) {
  const { t, i18n } = useTranslation('admin');
  return (
    <Stack spacing={2}>
      <Button onClick={onCreate}>{t('ingredient.new')}</Button>
      <TextField
        label={t('ingredient.filter')}
        value={filter}
        onChange={(event) => onFilterChange(event.target.value)}
      />
      {ingredients.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t('ingredient.empty')}
        </Typography>
      ) : (
        <Stack
          component="ul"
          spacing={1}
          sx={{ m: 0, p: 0, listStyle: 'none' }}
        >
          {ingredients.map((item) => (
            <li key={item.id}>
              <Button
                variant="text"
                aria-label={t('ingredient.edit', {
                  name: localName(item, i18n.language),
                })}
                onClick={() => onEdit(item.id)}
              >
                {localName(item, i18n.language)}
              </Button>
            </li>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
