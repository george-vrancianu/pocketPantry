import { Stack, Typography } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { ExpiringSoonSection } from './ExpiringSoonSection';
import { FamilyCard } from './FamilyCard';

/**
 * The Family tab. Shared Family settings: the Family card and Expiring soon are here, and Default expiry
 * is added below them by its own ticket.
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
    </Stack>
  );
}
