import { Box, Button, SignOutIcon, Stack, Typography } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AppScreenHeader } from '../../components/AppScreenHeader';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { useSession, useSignOut } from '../../lib/auth';

export function SettingsPage() {
  const { t } = useTranslation('settings');
  const session = useSession();
  const signOut = useSignOut();
  const navigate = useNavigate();

  return (
    <>
      <AppScreenHeader title={t('title')} />
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="sectionLabel" color="text.secondary">
            {t('language')}
          </Typography>
          <Box>
            <LanguageSwitcher />
          </Box>
        </Stack>
        <Stack spacing={1}>
          <Typography variant="sectionLabel" color="text.secondary">
            {t('account')}
          </Typography>
          {session.data ? (
            <Typography variant="body1">
              {t('signedInAs', { name: session.data.user.name })}
            </Typography>
          ) : null}
          <Box>
            <Button
              variant="secondary"
              startIcon={<SignOutIcon size={18} />}
              disabled={signOut.isPending}
              onClick={() =>
                signOut.mutate(undefined, {
                  onSuccess: () => navigate('/sign-in', { replace: true }),
                })
              }
            >
              {t('signOut')}
            </Button>
          </Box>
        </Stack>
      </Stack>
    </>
  );
}
