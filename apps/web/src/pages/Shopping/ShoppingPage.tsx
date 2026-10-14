import {
  Alert,
  Box,
  Button,
  ImportIcon,
  radius,
  tokens,
  Spinner,
  Stack,
  Typography,
  displayType,
} from '@pocket-pantry/ui';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppScreenHeader } from '../../components/AppScreenHeader';
import {
  RowToggleErrorProvider,
  useRowToggleErrors,
} from '../../components/RowToggleErrors';
import { RowHintNote } from '../../components/RowHintNote';
import { useRowHint } from '../../lib/useRowHint';
import { itemCount } from '../../lib/shopping';
import { UnverifiedToast } from '../../components/UnverifiedToast';
import { AddSheet, type SheetView } from './components/addSheet/AddSheet';
import { FinishShoppingReview } from './components/FinishShoppingReview';
import { ShoppingGroups } from './components/ShoppingGroups';
import { SaveTemplateSheet } from './components/SaveTemplateSheet';
import { ApplyTemplatesSheet } from './components/ApplyTemplatesSheet';
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
  const [saveOpen, setSaveOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);

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
      <AppScreenHeader
        title={t('shopping:title')}
        trailing={
          <Box
            component="button"
            type="button"
            aria-label={t('shopping:import.aria')}
            onClick={() => setApplyOpen(true)}
            sx={{
              height: 40,
              p: '0 14px 0 11px',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              border: 0,
              borderRadius: radius.pill,
              cursor: 'pointer',
              backgroundColor: tokens.color.surface,
              boxShadow: `inset 0 0 0 1px ${tokens.color.line}`,
              color: tokens.color.ink,
              font: 'inherit',
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            <Box
              component="span"
              aria-hidden
              sx={{ display: 'flex', color: tokens.color.accent }}
            >
              <ImportIcon size={18} />
            </Box>
            {t('shopping:import.button')}
          </Box>
        }
      />
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
                    ...displayType,
                    fontSize: 18,
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
                onClick={() => setSaveOpen(true)}
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
        suggestions={screen.suggestions}
      />
      <ApplyTemplatesSheet
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
      />
      <SaveTemplateSheet open={saveOpen} onClose={() => setSaveOpen(false)} />
    </RowToggleErrorProvider>
  );
}
