import { Tag } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';

/** The "Running low" chip, in the expiry tag's style (the `soon` tone). The caller shows it while the Ingredient is flagged. */
export function RunningLowChip() {
  const { t } = useTranslation('pantry');

  return <Tag tone="soon">{t('runningLow.chip')}</Tag>;
}
