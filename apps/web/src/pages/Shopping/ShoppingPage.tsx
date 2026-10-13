import {
  Alert,
  Box,
  Button,
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
import { AddSheet, type SheetView } from './components/addSheet/AddSheet';
import { FinishShoppingReview } from './components/FinishShoppingReview';
import { ShoppingGroups } from './components/ShoppingGroups';
import { SaveListRow } from './components/SaveListRow';
import { SummaryCard } from './components/SummaryCard';
import { useShoppingScreen } from './hooks/useShoppingScreen';

export function ShoppingPage() {
  const { t } = useTranslation(['shopping', 'common']);
  const screen = useShoppingScreen();
  const stapleErrors = useStapleErrors();
  const [reviewing, setReviewing] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetView, setSheetView] = useState<SheetView>({ tab: 'ingredients' });

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
      <AppScreenHeader title={t('shopping:title')} />
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
              onAddItems={() => {
                screen.resetAddError();
                setSheetView({ tab: 'ingredients' });
                setSheetOpen(true);
              }}
            />
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
            {screen.list.groups.length > 0 ? (
              <SaveListRow
                count={
                  screen.list.summary.remaining + screen.list.summary.checked
                }
                onClick={() => {
                  setSheetView({ tab: 'templates', view: 'save' });
                  setSheetOpen(true);
                }}
              />
            ) : null}
          </>
        ) : null}
      </Stack>
      <AddSheet
        open={sheetOpen}
        initialView={sheetView}
        onClose={() => setSheetOpen(false)}
        adding={screen.adding}
        onAdd={screen.add}
        addError={screen.addError}
        staples={screen.staples}
        usedUp={screen.usedUp}
      />
    </StapleErrorProvider>
  );
}
