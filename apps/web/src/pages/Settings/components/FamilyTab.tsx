import { Stack, Typography } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { DefaultExpirySection } from './DefaultExpirySection';

/**
 * The Family tab. Shared Family settings: the Family card, Expiring soon and
 * Default expiry are added here by the Settings follow-up tickets, below the intro.
 */
export function FamilyTab() {
  const { t } = useTranslation('settings');
  return (
    <Stack spacing={3}>
      <Typography variant="meta" color="text.secondary">
        {t('familyIntro')}
      </Typography>
      <DefaultExpirySection />
    </Stack>
  );
}
