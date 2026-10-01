import { Box, CenteredLayout, Stack, Typography } from '@pocket-pantry/ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';

type Props = { title: string; subtitle: string; children: ReactNode };

/** Frame shared by the sign-in and sign-up pages. */
export function AuthShell({ title, subtitle, children }: Props) {
  const { t } = useTranslation('common');
  return (
    <CenteredLayout>
      <Stack spacing={3}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Typography variant="sectionLabel" color="text.secondary">
            {t('appName')}
          </Typography>
          <LanguageSwitcher />
        </Box>
        <Stack spacing={0.5}>
          <Typography variant="h1">{title}</Typography>
          <Typography variant="meta" color="text.secondary">
            {subtitle}
          </Typography>
        </Stack>
        {children}
      </Stack>
    </CenteredLayout>
  );
}
