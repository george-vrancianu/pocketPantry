import { Box, GatorImage, Typography } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';

/** The app icon with the app's name beside it, so the logo never stands alone. */
export function BrandLockup() {
  const { t } = useTranslation('common');
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <GatorImage mood="app-icon" size={48} decorative />
      {/* Not a heading: the screen's own title is its heading. */}
      <Typography variant="h2" component="p">
        {t('appName')}
      </Typography>
    </Box>
  );
}
