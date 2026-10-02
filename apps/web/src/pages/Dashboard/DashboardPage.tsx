import {
  Alert,
  Box,
  Button,
  CustomiseIcon,
  IconButton,
  SettingsIcon,
  Spinner,
  Typography,
} from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../i18n/translateApiError';
import { useDashboardLayout } from '../../lib/dashboard';
import { greetingKeyForHour } from '../../lib/greeting';
import { useGridColumns } from '../../lib/layoutColumns';
import { WIDGET_REGISTRY } from './widgets/registry';

/** The Dashboard: date, greeting, Customise, and the Member's grid of Widgets. */
export function DashboardPage() {
  const { t, i18n } = useTranslation('dashboard');
  const layout = useDashboardLayout();
  const columns = useGridColumns();
  const now = new Date();
  const date = new Intl.DateTimeFormat(i18n.language, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(now);

  return (
    <>
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
      {layout.isPending ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Spinner label={t('common:loading')} />
        </Box>
      ) : layout.error ? (
        <Box>
          <Alert severity="error">{translateApiError(t, layout.error)}</Alert>
          <Button
            variant="text"
            onClick={() => void layout.refetch()}
            sx={{ mt: 1 }}
          >
            {t('common:retry')}
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            // Dense packing reorders cards on screen relative to the DOM, so use
            // it only on the 4-column grid, where tall cards leave gaps. On the
            // phone and 3-column grid visual order must match saved and tab
            // order (WCAG 1.3.2, 2.4.3).
            gridAutoFlow: columns === 4 ? 'dense' : 'row',
            // Tall cards span two rows: 2 x 150 + 16 gap = 316px, as in the mockup.
            gridAutoRows: columns === 4 ? 'minmax(150px, auto)' : undefined,
            gap: { xs: '12px', md: '16px' },
            pb: 2,
          }}
        >
          {layout.data.widgets.map(({ id, type, size }) => {
            // A layout saved by a newer app version may hold a type this one lacks.
            const definition = WIDGET_REGISTRY[type] as
              (typeof WIDGET_REGISTRY)[typeof type] | undefined;
            if (!definition) return null;
            const Widget = definition.component;
            return <Widget key={id} size={size} columns={columns} />;
          })}
        </Box>
      )}
    </>
  );
}
