import { Button, Stack, Typography } from '@pocket-pantry/ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { localName, type AdminAllergen } from '../../../lib/admin';

type Props = {
  /** In list order, retired ones included. */
  allergens: AdminAllergen[];
  onCreate: () => void;
  onEdit: (id: string) => void;
};

/** The Allergen list Members pick their Allergies from, retired entries included and marked. */
export function AllergenList({ allergens, onCreate, onEdit }: Props) {
  const { t, i18n } = useTranslation('admin');
  const headingId = useId();
  return (
    <Stack spacing={1} component="section" aria-labelledby={headingId}>
      <Typography id={headingId} component="h2" variant="h6">
        {t('allergen.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {t('allergen.hint')}
      </Typography>
      <div>
        <Button onClick={onCreate}>{t('allergen.new')}</Button>
      </div>
      {allergens.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t('allergen.empty')}
        </Typography>
      ) : null}
      <Stack
        component="ul"
        aria-labelledby={headingId}
        spacing={0.5}
        sx={{ m: 0, p: 0, listStyle: 'none' }}
      >
        {allergens.map((allergen) => {
          const name = localName(allergen, i18n.language);
          return (
            <Stack
              key={allergen.id}
              component="li"
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center' }}
            >
              <Button
                variant="ghost"
                aria-label={t('allergen.edit', { name })}
                onClick={() => onEdit(allergen.id)}
              >
                {name}
              </Button>
              {allergen.archived ? (
                <Typography variant="body2" color="text.secondary">
                  {t('allergen.retiredBadge')}
                </Typography>
              ) : null}
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
}
