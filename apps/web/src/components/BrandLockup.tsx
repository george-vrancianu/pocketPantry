import { Box, Gator, Typography } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';

type Props = {
  /** Gator hops in on mount. Off where the lockup is an inline header (Languages). */
  entrance?: boolean;
};

/** The app icon with the app's name beside it, so the logo never stands alone. */
export function BrandLockup({ entrance = true }: Props) {
  const { t } = useTranslation('common');
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <Gator
        mood="app-icon"
        size={44}
        loop="idle"
        entrance={entrance}
        decorative
      />
      {/* Not a heading, and smaller than one: the screen's own title is its heading. */}
      <Typography variant="h4" component="p">
        {t('appName')}
      </Typography>
    </Box>
  );
}
