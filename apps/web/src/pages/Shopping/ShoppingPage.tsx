import { Alert, Button, Spinner, Stack, Typography } from '@pocket-pantry/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppScreenHeader } from '../../components/AppScreenHeader';
import { AddItemForm } from './components/AddItemForm';
import { FinishShoppingReview } from './components/FinishShoppingReview';
import { ShoppingGroups } from './components/ShoppingGroups';
import { SummaryCard } from './components/SummaryCard';
import { useShoppingScreen } from './hooks/useShoppingScreen';

export function ShoppingPage() {
  const { t } = useTranslation(['shopping', 'common']);
  const screen = useShoppingScreen();
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
    <>
      <AppScreenHeader title={t('shopping:title')} />
      <Stack spacing={2.5}>
        {screen.error ? <Alert>{screen.error}</Alert> : null}
        {screen.isLoading ? <Spinner label={t('common:loading')} /> : null}
        {!screen.list && !screen.isLoading ? (
          <Button onClick={screen.retry}>{t('common:retry')}</Button>
        ) : null}
        {screen.list ? (
          <>
            <SummaryCard
              remaining={screen.list.summary.remaining}
              checked={screen.list.summary.checked}
            />
            <AddItemForm adding={screen.adding} onAdd={screen.add} />
            {screen.list.groups.length === 0 ? (
              <Typography color="text.secondary">
                {t('shopping:empty')}
              </Typography>
            ) : (
              <ShoppingGroups
                groups={screen.list.groups}
                onToggle={screen.toggle}
                onRemove={screen.remove}
              />
            )}
            {screen.list.summary.checked > 0 ? (
              <Button onClick={() => setReviewing(true)}>
                {t('shopping:finish.button')}
              </Button>
            ) : null}
          </>
        ) : null}
      </Stack>
    </>
  );
}
