import { Stack, Typography } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { DefaultExpirySection } from './DefaultExpirySection';
import { ExpiringSoonSection } from './ExpiringSoonSection';
import { FamilyCatalogSection } from './FamilyCatalogSection';
import { FamilyCard } from './FamilyCard';

/**
 * The Family tab: the Family card, then the intro, then the shared Family Settings (Expiring soon and
 * Default expiry), then the Family catalog.
 */
export function FamilyTab() {
  const { t } = useTranslation('settings');
  return (
    <Stack spacing={3}>
      <FamilyCard />
      <Typography variant="meta" color="text.secondary">
        {t('familyIntro')}
      </Typography>
      <ExpiringSoonSection />
      <DefaultExpirySection />
      <FamilyCatalogSection />
    </Stack>
  );
}
