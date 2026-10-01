import { Alert, Button, Spinner, Stack } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { AppScreenHeader } from '../../components/AppScreenHeader';
import { InviteCodePanel } from './components/InviteCodePanel';
import { MemberList } from './components/MemberList';
import { useFamilyScreen } from './hooks/useFamilyScreen';

export function FamilyPage() {
  const { t } = useTranslation(['family', 'common']);
  const screen = useFamilyScreen();

  return (
    <>
      <AppScreenHeader title={t('family:title')} />
      <Stack spacing={3}>
        {screen.error ? <Alert>{screen.error}</Alert> : null}
        {screen.isLoading ? <Spinner label={t('common:loading')} /> : null}
        {!screen.family && !screen.isLoading ? (
          <Button onClick={screen.retry}>{t('common:retry')}</Button>
        ) : null}
        {screen.family ? (
          <>
            <MemberList members={screen.family.members} />
            <InviteCodePanel
              code={screen.family.inviteCode}
              expiryLabel={screen.expiryLabel ?? ''}
              expired={screen.expired}
              isOwner={screen.family.currentMemberIsOwner}
              regenerating={screen.regenerating}
              onRegenerate={screen.regenerate}
            />
          </>
        ) : null}
      </Stack>
    </>
  );
}
