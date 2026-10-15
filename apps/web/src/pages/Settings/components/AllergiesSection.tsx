import { Alert, Card, Chip, Stack, Typography } from '@pocket-pantry/ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { useAllergies, useSaveAllergies } from '../../../lib/settings';
import { SectionHeading } from './SectionHeading';

/**
 * The Member's own Allergies, picked from the Allergen list. Each pick is saved at once. An
 * Allergy is not a Member Preference: the Family can see it, and it stays with the Member.
 */
export function AllergiesSection() {
  const { t, i18n } = useTranslation('settings');
  const id = useId();
  const query = useAllergies(i18n.language);
  const save = useSaveAllergies(i18n.language);
  const view = query.data;
  const toggle = (allergenId: string) => {
    if (!view) return;
    const chosen = new Set(view.allergenIds);
    if (!chosen.delete(allergenId)) chosen.add(allergenId);
    // Keep the Allergen list's order, so the saved set reads the same everywhere.
    save.mutate(
      view.allergens.filter((a) => chosen.has(a.id)).map((a) => a.id),
    );
  };
  return (
    <Stack component="section" spacing={1} aria-labelledby={`${id}-title`}>
      <SectionHeading id={`${id}-title`} title={t('allergies.title')} />
      <Card>
        <Stack spacing={1.5}>
          <Typography variant="meta" color="text.secondary">
            {t('allergies.hint')} {t('allergies.familyCanSee')}{' '}
            {t('allergies.noAccount')}
          </Typography>
          {query.isError ? <Alert>{t('allergies.loadFailed')}</Alert> : null}
          {view ? (
            <Stack
              direction="row"
              sx={{ flexWrap: 'wrap', gap: 1 }}
              role="group"
              aria-label={t('allergies.title')}
            >
              {view.allergens.map((allergen) => (
                <Chip
                  key={allergen.id}
                  label={allergen.name}
                  selected={view.allergenIds.includes(allergen.id)}
                  disabled={save.isPending}
                  onClick={() => toggle(allergen.id)}
                />
              ))}
            </Stack>
          ) : null}
          {save.isError ? <Alert>{t('allergies.saveFailed')}</Alert> : null}
        </Stack>
      </Card>
    </Stack>
  );
}
