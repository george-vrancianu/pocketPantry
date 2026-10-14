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
} from '../../components/StapleToggle';
import { RowHintNote } from '../../components/RowHintNote';
import { UnverifiedToast } from '../../components/UnverifiedToast';
import { AddBatchForm } from './components/AddBatchForm';
import { LocationSection } from './components/LocationSection';
import { RunningLowKeyHints } from './components/RollUpRow';
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

  // The header's Add button is replaced while the form is open: put focus back on it afterwards.
  const wasAdding = useRef(false);
  useEffect(() => {
    if (wasAdding.current && !screen.adding) focusAdd();
    wasAdding.current = screen.adding;
  }, [screen.adding, t]);

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
          onSaved={screen.stopAdding}
          onCancel={screen.stopAdding}
        />
      ) : (
        <Stack spacing={1}>
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
              onEmptied={focusAdd}
              rowHint={rowHint}
            />
          ))}
        </Stack>
      )}
      <RunningLowKeyHints />
    </RowToggleErrorProvider>
  );
}
