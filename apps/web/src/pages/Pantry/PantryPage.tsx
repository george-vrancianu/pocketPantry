import { VoiceNote } from '../Shopping/components/VoiceNote';
import {
  Alert,
  Button,
  PlusIcon,
  Spinner,
  Stack,
  Typography,
} from '@pocket-pantry/ui';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AppScreenHeader } from '../../components/AppScreenHeader';
import {
  RowToggleErrorProvider,
  useRowToggleErrors,
} from '../../components/RowToggleErrors';
import { RowHintNote } from '../../components/RowHintNote';
import { UnverifiedToast } from '../../components/UnverifiedToast';
import { AddBatchForm } from './components/AddBatchForm';
import { LocationSection } from './components/LocationSection';
import { RowKeyHints } from './components/RowKeyHints';
import { PantryFilters } from './components/PantryFilters';
import { usePantryRowHint } from './hooks/usePantryRowHint';
import { usePantryScreen } from './hooks/usePantryScreen';

export function PantryPage() {
  const { t } = useTranslation(['pantry', 'common']);
  const screen = usePantryScreen();
  const rowToggleErrors = useRowToggleErrors();
  const rowHint = usePantryRowHint();

  const focusAdd = () =>
    document
      .querySelector<HTMLElement>(`[aria-label="${t('pantry:add')}"]`)
      ?.focus();

  // The form replaces the list and the header's Add button while open: afterwards put focus back on
  // the Ingredient row whose Add batch button opened it, or else on the header's Add button.
  const wasAdding = useRef<{ from?: string } | null>(null);
  useEffect(() => {
    const closedAdding = wasAdding.current;
    if (closedAdding && !screen.adding) {
      const row = [
        ...document.querySelectorAll<HTMLElement>('[data-open-key]'),
      ].find((element) => element.dataset.openKey === closedAdding.from);
      if (row) row.focus();
      else focusAdd();
    }
    wasAdding.current = screen.adding ? { from: screen.addingFrom } : null;
  }, [screen.adding, screen.addingFrom, t]);

  return (
    <RowToggleErrorProvider report={rowToggleErrors.report}>
      <UnverifiedToast />
      <AppScreenHeader
        title={t('pantry:title')}
        action={
          screen.adding
            ? undefined
            : {
                label: t('pantry:add'),
                icon: <PlusIcon size={20} />,
                onClick: screen.startAdding,
              }
        }
      />
      <RowHintNote hint={rowHint.hint} />
      {screen.adding ? (
        <AddBatchForm
          start={screen.addStart}
          onSaved={screen.stopAdding}
          onCancel={screen.stopAdding}
        />
      ) : (
        <Stack spacing={1}>
          <VoiceNote defaultTarget="pantry" />
          {screen.error ? <Alert>{screen.error}</Alert> : null}
          {rowToggleErrors.message ? (
            <Alert>{rowToggleErrors.message}</Alert>
          ) : null}
          {screen.error ? (
            <Button onClick={screen.retry}>{t('common:retry')}</Button>
          ) : null}
          {screen.isLoading ? <Spinner label={t('common:loading')} /> : null}
          {screen.isEmpty ? (
            <Typography color="text.secondary">{t('pantry:empty')}</Typography>
          ) : null}
          {!screen.isEmpty && !screen.isLoading && !screen.error ? (
            <PantryFilters
              query={screen.query}
              onQueryChange={screen.setQuery}
              filter={screen.filter}
              onFilterChange={screen.setFilter}
              counts={screen.counts}
            />
          ) : null}
          {screen.noMatches ? (
            <Typography color="text.secondary">
              {t('pantry:noMatches')}
            </Typography>
          ) : null}
          {screen.sections.map((section) => (
            <LocationSection
              key={section.location}
              location={section.location}
              batchCount={section.batchCount}
              rows={section.rows}
              today={screen.today}
              onToggleOpen={screen.toggleOpen}
              onRemoveBatch={(batch) =>
                screen.removeBatch(batch.id, batch.name)
              }
              onAddBatch={screen.startAddingTo}
              onEmptied={focusAdd}
              rowHint={rowHint}
            />
          ))}
        </Stack>
      )}
      <RowKeyHints />
    </RowToggleErrorProvider>
  );
}
