import { Box, Stack, Typography, radius, tokens } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import type { RecipeAllergens } from '../../../lib/recipes';
import { Section } from './Section';

/**
 * What the Recipe is known to contain, worked out from its Ingredient Lines
 * (ADR 0014). Never claims a Recipe is free of anything: with nothing found it
 * says so, and it always reminds the reader to check product labels.
 */
export function AllergensCard({ allergens }: { allergens: RecipeAllergens }) {
  const { t } = useTranslation('recipes');
  const { items, uncheckedCount } = allergens;
  return (
    <Section card title={t('allergens.title')}>
      <Stack spacing={1}>
        {items.length === 0 ? (
          <Typography>{t('allergens.none')}</Typography>
        ) : (
          <Stack
            component="ul"
            spacing={1}
            sx={{ listStyle: 'none', m: 0, p: 0 }}
          >
            {items.map((item) => (
              <Box component="li" key={item.allergen.id}>
                <Box component="span" sx={{ fontWeight: 700 }}>
                  {item.allergen.name}
                </Box>
                {item.optionalOnly ? (
                  <Box
                    component="span"
                    sx={{
                      ml: '8px',
                      fontSize: 12,
                      fontWeight: 700,
                      px: '10px',
                      py: '2px',
                      borderRadius: radius.pill,
                      bgcolor: tokens.color.soonBg,
                      color: tokens.color.soonFg,
                    }}
                  >
                    {t('allergens.optional')}
                  </Box>
                ) : null}
                <Box
                  sx={{
                    fontSize: 13.5,
                    lineHeight: 1.4,
                    color: tokens.color.muted,
                  }}
                >
                  {item.lines.map((line) => line.ingredientName).join(', ')}
                </Box>
              </Box>
            ))}
          </Stack>
        )}
        {uncheckedCount > 0 ? (
          <Typography variant="meta" color="text.secondary">
            {t('allergens.unchecked', { count: uncheckedCount })}
          </Typography>
        ) : null}
        <Typography variant="meta" color="text.secondary">
          {t('allergens.reminder')}
        </Typography>
      </Stack>
    </Section>
  );
}
