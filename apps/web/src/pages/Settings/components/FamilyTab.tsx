import { Stack, Typography } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { DefaultExpirySection } from './DefaultExpirySection';
import { ExpiringSoonSection } from './ExpiringSoonSection';
import { FamilyCard } from './FamilyCard';

/**
 * The Family tab. Shared Family settings: the Family card, Expiring soon, and Default expiry below them.
 */
export function FamilyTab() {
  const { t } = useTranslation('settings');
  return (
    <Stack spacing={3}>
      <Typography variant="meta" color="text.secondary">
        {t('familyIntro')}
      </Typography>
      <FamilyCard />
      <ExpiringSoonSection />
      <DefaultExpirySection />
    </Stack>
  );
}
