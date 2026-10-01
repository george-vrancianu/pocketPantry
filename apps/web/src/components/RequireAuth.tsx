import { Alert, Box, Button, Stack } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { translateApiError } from '../i18n/translateApiError';
import { useSession } from '../lib/auth';
import { FullPageSpinner } from './FullPageSpinner';

/** Route guard: signed-out visitors go to sign in and come back afterwards. */
export function RequireAuth() {
  const { t } = useTranslation('common');
  const session = useSession();
  const location = useLocation();

  if (session.isPending) return <FullPageSpinner />;

  if (session.isError) {
    return (
      <Box sx={{ p: '20px', maxWidth: 420, mx: 'auto' }}>
        <Stack spacing={2}>
          <Alert>{translateApiError(t, session.error)}</Alert>
          <Button onClick={() => void session.refetch()}>{t('retry')}</Button>
        </Stack>
      </Box>
    );
  }

  if (!session.data) {
    return (
      <Navigate to="/sign-in" state={{ from: location.pathname }} replace />
    );
  }
  return <Outlet />;
}
