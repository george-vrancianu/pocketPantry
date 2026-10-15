import { Alert, Box, Button, Spinner, Stack } from '@pocket-pantry/ui';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTemplates } from '../../lib/shoppingTemplates';
import { AppScreenHeader } from '../../components/AppScreenHeader';
import {
  RowToggleErrorProvider,
  useRowToggleErrors,
} from '../../components/RowToggleErrors';
import { RowHintNote } from '../../components/RowHintNote';
import { useRowHint } from '../../lib/useRowHint';
import { itemCount } from '../../lib/shopping';
import { UnverifiedToast } from '../../components/UnverifiedToast';
import { AddSheet } from './components/addSheet/AddSheet';
import { FinishShoppingReview } from './components/FinishShoppingReview';
import { ShoppingGroups } from './components/ShoppingGroups';
import { SaveTemplateSheet } from './components/SaveTemplateSheet';
import { ImportPill } from './components/ImportPill';
import { ApplyTemplatesSheet } from './components/ApplyTemplatesSheet';
import { SaveListRow } from './components/SaveListRow';
import { EmptyListStart } from './components/EmptyListStart';
import { SummaryCard } from './components/SummaryCard';
import { useShoppingScreen } from './hooks/useShoppingScreen';

export function ShoppingPage() {
  const { t, i18n } = useTranslation(['shopping', 'common']);
  const templates = useTemplates(i18n.language);
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
  const [saveOpen, setSaveOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);

  // Every way in starts clean, with no error left from an earlier opening.
  const openSheet = () => {
    screen.resetAddError();
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
        trailing={<ImportPill onClick={() => setApplyOpen(true)} />}
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
              onAddItems={() => openSheet()}
            />
            {screen.list.groups.length === 0 ? (
              <Box ref={empty} tabIndex={-1} sx={{ outline: 'none' }}>
                <EmptyListStart
                  templateCount={templates.data?.length ?? 0}
                  onAddItems={() => openSheet()}
                  onImport={() => setApplyOpen(true)}
                />
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
