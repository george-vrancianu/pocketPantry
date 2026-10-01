import {
  Alert,
  Box,
  Button,
  Link,
  Stack,
  TextField,
  Typography,
} from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { AuthShell } from '../../components/AuthShell';
import { useSignUpForm } from './hooks/useSignUpForm';

export function SignUpPage() {
  const { t } = useTranslation('signUp');
  const { submit, pending, error } = useSignUpForm();

  return (
    <AuthShell title={t('title')} subtitle={t('subtitle')}>
      <Box component="form" onSubmit={submit} sx={{ display: 'contents' }}>
        <Stack spacing={2}>
          {error ? <Alert>{error}</Alert> : null}
          <TextField
            name="name"
            label={t('name')}
            autoComplete="name"
            required
          />
          <TextField
            name="email"
            type="email"
            label={t('email')}
            autoComplete="email"
            required
          />
          <TextField
            name="password"
            type="password"
            label={t('password')}
            helperText={t('passwordHint')}
            autoComplete="new-password"
            slotProps={{ htmlInput: { minLength: 8 } }}
            required
          />
          <Button type="submit" disabled={pending}>
            {pending ? t('submitting') : t('submit')}
          </Button>
        </Stack>
      </Box>
      <Typography variant="meta" color="text.secondary">
        {t('haveAccount')} <Link href="/sign-in">{t('signIn')}</Link>
      </Typography>
    </AuthShell>
  );
}
