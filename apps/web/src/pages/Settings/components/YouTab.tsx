import {
  Alert,
  Box,
  Button,
  Card,
  ChevronRightIcon,
  Link,
  LogoutIcon,
  PantryIcon,
  radius,
  Stack,
  Typography,
  useToast,
} from '@pocket-pantry/ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LanguageSwitcher } from '../../../components/LanguageSwitcher';
import { useSession, useSignOut } from '../../../lib/auth';
import { useSaveLocale } from '../../../lib/settings';
import { useLoadedUnmatchedCount } from '../hooks/useLoadedUnmatchedCount';
import { AppearanceCard } from './AppearanceCard';
import { ScopeCaption, SectionHeading } from './SectionHeading';

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

/** The You tab: the Member's own settings, each change saved as it is made. */
export function YouTab() {
  const { t, i18n } = useTranslation('settings');
  const session = useSession();
  const signOut = useSignOut();
  const saveLocale = useSaveLocale();
  const toast = useToast();
  const navigate = useNavigate();
  const id = useId();
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const isAdmin = session.data?.user.role === 'admin';
  const unmatched = useLoadedUnmatchedCount(isAdmin);

  return (
    <Stack spacing={3}>
      <Typography variant="meta" color="text.secondary">
        {t('youIntro')}
      </Typography>
      <AppearanceCard />
      <Stack component="section" spacing={1} aria-labelledby={`${id}-language`}>
        <SectionHeading
          id={`${id}-language`}
          title={t('language')}
          scope={<ScopeCaption scope="you" label={t('scope.you')} />}
        />
        <Box>
          <LanguageSwitcher
            fullWidth
            ownNames={{
              en: t('languageNames.en'),
              ro: t('languageNames.ro'),
              da: t('languageNames.da'),
            }}
            onChange={(locale) =>
              saveLocale.mutate(locale, {
                onSuccess: () =>
                  toast.show(
                    i18n.getFixedT(locale, 'settings')('languageSaved'),
                  ),
              })
            }
          />
        </Box>
        {saveLocale.isError ? <Alert>{t('localeSaveFailed')}</Alert> : null}
      </Stack>
      {isAdmin ? (
        <Stack component="section" spacing={1} aria-labelledby={`${id}-admin`}>
          <SectionHeading
            id={`${id}-admin`}
            title={t('admin')}
            scope={<ScopeCaption scope="admins" label={t('scope.admins')} />}
          />
          <Card sx={{ py: 1 }}>
            <Link
              href="/admin"
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: radius.control,
                  bgcolor: 'pp.accentTint',
                  color: 'pp.accentOnTint',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <PantryIcon size={20} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600 }}>
                  {t('openAdmin')}
                </Typography>
                {unmatched !== null ? (
                  <Typography variant="meta" color="text.secondary">
                    {t('unmatched', { count: unmatched })}
                  </Typography>
                ) : null}
              </Box>
              <Box
                component="span"
                aria-hidden
                sx={{ display: 'inline-flex', color: 'text.secondary' }}
              >
                <ChevronRightIcon size={18} />
              </Box>
            </Link>
          </Card>
        </Stack>
      ) : null}
      <Stack component="section" spacing={1} aria-labelledby={`${id}-account`}>
        <SectionHeading id={`${id}-account`} title={t('account')} />
        <Card>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box
              aria-hidden
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: 'pp.accentTint',
                color: 'pp.accentOnTint',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {session.data ? initials(session.data.user.name) : ''}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600 }}>
                {session.data?.user.name}
              </Typography>
              <Typography variant="meta" color="text.secondary">
                {session.data?.user.email}
              </Typography>
            </Box>
          </Stack>
        </Card>
        {confirmingSignOut ? (
          <Box
            role="group"
            aria-label={t('signOutConfirm')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              p: '10px 12px',
              borderRadius: radius.control,
              bgcolor: 'pp.subtle',
            }}
          >
            <Typography variant="body2">{t('signOutConfirm')}</Typography>
            <Stack direction="row" spacing={0.5}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmingSignOut(false)}
              >
                {t('cancel')}
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={signOut.isPending}
                onClick={() =>
                  signOut.mutate(undefined, {
                    onSuccess: () => navigate('/sign-in', { replace: true }),
                  })
                }
              >
                {t('signOut')}
              </Button>
            </Stack>
          </Box>
        ) : (
          <Button
            variant="secondary"
            fullWidth
            startIcon={<LogoutIcon size={18} />}
            onClick={() => setConfirmingSignOut(true)}
          >
            {t('signOut')}
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
