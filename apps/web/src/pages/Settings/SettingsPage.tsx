import {
  Alert,
  Box,
  Button,
  Link,
  SignOutIcon,
  Stack,
  Typography,
} from '@pocket-pantry/ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AppScreenHeader } from '../../components/AppScreenHeader';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { useSession, useSignOut } from '../../lib/auth';
import { useSaveLocale } from '../../lib/settings';
import { FamilySettingsSection } from './components/FamilySettingsSection';

export function SettingsPage() {
  const { t } = useTranslation('settings');
  const session = useSession();
  const signOut = useSignOut();
  const saveLocale = useSaveLocale();
  const navigate = useNavigate();
  const id = useId();

  return (
    <>
      <AppScreenHeader title={t('title')} />
      <Stack spacing={3}>
        <FamilySettingsSection />
        <Stack component="section" spacing={1} aria-labelledby={`${id}-prefs`}>
          <Typography
            id={`${id}-prefs`}
            variant="sectionLabel"
            component="h2"
            color="text.secondary"
          >
            {t('preferences')}
          </Typography>
          <Typography variant="meta" color="text.secondary">
            {t('preferencesPrivate')}
          </Typography>
          <Typography variant="body1">{t('language')}</Typography>
          <Box>
            <LanguageSwitcher
              onChange={(locale) => saveLocale.mutate(locale)}
            />
          </Box>
          {saveLocale.isError ? <Alert>{t('localeSaveFailed')}</Alert> : null}
        </Stack>
        {session.data?.user.role === 'admin' ? (
          <Stack spacing={1}>
            <Typography variant="sectionLabel" color="text.secondary">
              {t('admin')}
            </Typography>
            <Box>
              <Link href="/admin">{t('openAdmin')}</Link>
            </Box>
          </Stack>
        ) : null}
        <Stack
          component="section"
          spacing={1}
          aria-labelledby={`${id}-account`}
        >
          <Typography
            id={`${id}-account`}
            variant="sectionLabel"
            component="h2"
            color="text.secondary"
          >
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
