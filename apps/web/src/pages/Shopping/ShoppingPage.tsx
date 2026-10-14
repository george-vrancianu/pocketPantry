import {
  Alert,
  Box,
  Button,
  Spinner,
  Stack,
  Typography,
} from '@pocket-pantry/ui';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppScreenHeader } from '../../components/AppScreenHeader';
import {
  RowToggleErrorProvider,
  useRowToggleErrors,
} from '../../components/StapleToggle';
import { RowHintNote } from '../../components/RowHintNote';
import { useRowHint } from '../../lib/useRowHint';
import { itemCount } from '../../lib/shopping';
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
  const rowToggleErrors = useRowToggleErrors();
  const [reviewing, setReviewing] = useState(false);
  const hint = useRowHint(
    'shopping',
    !reviewing && (screen.list?.groups.length ?? 0) > 0,
  );
  // Removing the last row unmounts the list that held focus: hand it to the empty text.
  const empty = useRef<HTMLDivElement>(null);
  const hadGroups = useRef(false);
  const groupCount = screen.list?.groups.length ?? 0;
  useEffect(() => {
    if (groupCount === 0 && hadGroups.current) {
      const active = document.activeElement;
      if (!active || active === document.body) empty.current?.focus();
    }
    hadGroups.current = groupCount > 0;
  }, [groupCount]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetView, setSheetView] = useState<SheetView>({ tab: 'ingredients' });

  // Every way in starts clean, with no error left from an earlier opening.
  const openSheet = (view: SheetView) => {
    screen.resetAddError();
    setSheetView(view);
    setSheetOpen(true);
  };

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
    <RowToggleErrorProvider report={rowToggleErrors.report}>
      <UnverifiedToast />
      <AppScreenHeader title={t('shopping:title')} />
      <RowHintNote hint={hint} />
      <Stack spacing={2.5}>
        {screen.error ? <Alert>{screen.error}</Alert> : null}
        {rowToggleErrors.message ? (
          <Alert>{rowToggleErrors.message}</Alert>
        ) : null}
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
              onAddItems={() => openSheet({ tab: 'ingredients' })}
            />
            {screen.list.groups.length === 0 ? (
              <Box
                ref={empty}
                tabIndex={-1}
                sx={{ textAlign: 'center', py: 3, outline: 'none' }}
              >
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
                onSetAmount={screen.setAmount}
                onRemove={screen.remove}
                hint={hint}
              />
            )}
            {screen.list.groups.length > 0 ? (
              <SaveListRow
                count={itemCount(screen.list.summary)}
                onClick={() => openSheet({ tab: 'templates', view: 'save' })}
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
        runningLow={screen.runningLow}
      />
    </RowToggleErrorProvider>
  );
}
