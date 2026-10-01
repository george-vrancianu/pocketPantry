import {
  Box,
  CustomiseIcon,
  IconButton,
  SettingsIcon,
  Typography,
} from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { greetingKeyForHour } from '../../lib/greeting';

/** The Dashboard: date, greeting, Customise. Widgets arrive in a later ticket. */
export function DashboardPage() {
  const { t, i18n } = useTranslation('dashboard');
  const now = new Date();
  const date = new Intl.DateTimeFormat(i18n.language, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(now);

  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '12px',
        pt: '28px',
        pb: '18px',
      }}
    >
      <Box>
        <Typography
          variant="meta"
          color="text.secondary"
          sx={{ fontWeight: 600 }}
        >
          {date}
        </Typography>
        <Typography variant="h1" sx={{ mt: '4px' }}>
          {t(`greeting.${greetingKeyForHour(now.getHours())}`)}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: '8px' }}>
        <IconButton label={t('settings')} href="/settings">
          <SettingsIcon size={20} />
        </IconButton>
        <IconButton label={t('customise')} href="/customise">
          <CustomiseIcon size={20} />
        </IconButton>
      </Box>
    </Box>
  );
}
