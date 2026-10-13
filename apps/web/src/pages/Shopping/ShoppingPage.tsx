import {
  Alert,
  Box,
  Button,
  Link,
  Spinner,
  Stack,
  Typography,
} from '@pocket-pantry/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppScreenHeader } from '../../components/AppScreenHeader';
import {
  StapleErrorProvider,
  useStapleErrors,
} from '../../components/StapleToggle';
import { UnverifiedToast } from '../../components/UnverifiedToast';
import { AddItemForm } from './components/AddItemForm';
import { FinishShoppingReview } from './components/FinishShoppingReview';
import { ShoppingGroups } from './components/ShoppingGroups';
import { SuggestionsSection } from './components/SuggestionsSection';
import { SummaryCard } from './components/SummaryCard';
import { TemplateActions } from './templates/TemplateActions';
import { useShoppingScreen } from './hooks/useShoppingScreen';

export function ShoppingPage() {
  const { t } = useTranslation(['shopping', 'common']);
  const screen = useShoppingScreen();
  const stapleErrors = useStapleErrors();
  const [reviewing, setReviewing] = useState(false);

  if (reviewing) {
    return (
      <>
        <AppScreenHeader title={t('shopping:title')} />
        <FinishShoppingReview
          onDone={() => setReviewing(false)}
          onCancel={() => setReviewing(false)}
        />
      </>
    );
  }

  return (
    <StapleErrorProvider report={stapleErrors.report}>
      <UnverifiedToast />
      <AppScreenHeader
        title={t('shopping:title')}
        trailing={<Link href="/shopping/staples">{t('shopping:staples')}</Link>}
      />
      <Stack spacing={2.5}>
        {screen.error ? <Alert>{screen.error}</Alert> : null}
        {stapleErrors.message ? <Alert>{stapleErrors.message}</Alert> : null}
        {screen.isLoading ? <Spinner label={t('common:loading')} /> : null}
        {!screen.list && !screen.isLoading ? (
          <Button onClick={screen.retry}>{t('common:retry')}</Button>
        ) : null}
        {screen.list ? (
          <>
            <SummaryCard
              remaining={screen.list.summary.remaining}
              checked={screen.list.summary.checked}
              onFinish={() => setReviewing(true)}
            />
            <SuggestionsSection
              staples={screen.staples}
              usedUp={screen.usedUp}
              onAdd={screen.add}
            />
            <AddItemForm adding={screen.adding} onAdd={screen.add} />
            <TemplateActions />
            {screen.list.groups.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography
                  sx={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  {t('shopping:empty.title')}
                </Typography>
                <Typography variant="meta" color="text.secondary">
                  {t('shopping:empty.hint')}
                </Typography>
              </Box>
            ) : (
              <ShoppingGroups
                groups={screen.list.groups}
                onToggle={screen.toggle}
                onRemove={screen.remove}
              />
            )}
          </>
        ) : null}
      </Stack>
    </StapleErrorProvider>
  );
}
