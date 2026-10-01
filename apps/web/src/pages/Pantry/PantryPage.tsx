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
import { AddBatchForm } from './components/AddBatchForm';
import { LocationSection } from './components/LocationSection';
import { PantryFilters } from './components/PantryFilters';
import { usePantryScreen } from './hooks/usePantryScreen';

export function PantryPage() {
  const { t } = useTranslation(['pantry', 'common']);
  const screen = usePantryScreen();

  // The header's Add button is replaced while the form is open: put focus back on it afterwards.
  const wasAdding = useRef(false);
  useEffect(() => {
    if (wasAdding.current && !screen.adding) {
      document
        .querySelector<HTMLElement>(`[aria-label="${t('pantry:add')}"]`)
        ?.focus();
    }
    wasAdding.current = screen.adding;
  }, [screen.adding, t]);

  return (
    <>
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
      {screen.adding ? (
        <AddBatchForm
          onSaved={screen.stopAdding}
          onCancel={screen.stopAdding}
        />
      ) : (
        <Stack spacing={1}>
          {screen.error ? <Alert>{screen.error}</Alert> : null}
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
            />
          ))}
        </Stack>
      )}
    </>
  );
}
