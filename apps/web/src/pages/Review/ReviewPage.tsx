import { Alert, Box, Button, Stack, Typography } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { AppScreenHeader } from '../../components/AppScreenHeader';
import { MatchDialog } from './components/MatchDialog';
import { ReviewActionBar } from './components/ReviewActionBar';
import { ReviewCounters } from './components/ReviewCounters';
import { ReviewTable } from './components/ReviewTable';
import { useReviewScreen } from './hooks/useReviewScreen';

/**
 * The Review screen: where a Member confirms, edits, or discards Scan results
 * before anything is saved. Every Scan Mode lands here with the same proposed
 * lines (see `lib/review.ts`). Lines to check sort to the top, already open;
 * confident ones are single rows. This is the phone layout, used at every width.
 */
export function ReviewPage() {
  const { t } = useTranslation('review');
  const screen = useReviewScreen();

  if (screen.tickFailures) {
    const { missing, changed, other } = screen.tickFailures;
    return (
      <>
        <AppScreenHeader title={t('saved.title')} />
        <Stack spacing={2}>
          <Alert severity="warning">
            <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2 }}>
              {missing > 0 ? (
                <li>{t('tick.missing', { count: missing })}</li>
              ) : null}
              {changed > 0 ? (
                <li>{t('tick.changed', { count: changed })}</li>
              ) : null}
              {other > 0 ? <li>{t('tick.failed', { count: other })}</li> : null}
            </Stack>
          </Alert>
          <Button onClick={screen.toPantry}>{t('saved.toPantry')}</Button>
        </Stack>
      </>
    );
  }

  if (!screen.hadDraft) return <Navigate to="/scan" replace />;

  const { counts, groups } = screen;
  const read = counts.save + counts.excluded;
  const subtitle = t('subtitle.lines', {
    count: read,
    mode: t(`subtitle.mode.${screen.mode ?? 'product'}`),
  });
  const saveLabel = screen.saving
    ? t(screen.shopping ? 'shoppingAdding' : 'pantry:form.saving')
    : t(screen.shopping ? 'shoppingSave' : 'save', { count: counts.save });

  return (
    <>
      <AppScreenHeader title={t('title')} subtitle={subtitle} />
      {read === 0 ? (
        <Stack spacing={2}>
          <Typography color="text.secondary">{t('empty')}</Typography>
          <Button onClick={screen.discard}>{t('backToScan')}</Button>
        </Stack>
      ) : (
        // Room under the last row for the fixed action bar.
        <Box sx={{ pb: '100px' }}>
          <ReviewCounters {...counts} />
          <ReviewTable
            state={screen.state}
            groups={groups}
            parents={screen.parents}
            shopping={screen.shopping}
            onToggle={screen.toggle}
            onChange={screen.change}
            onSwapMatch={screen.openSwap}
            onRemove={screen.remove}
            onConfirm={screen.confirm}
            onRestore={screen.restore}
            onToggleSureGroup={screen.toggleSureGroup}
            blocked={screen.blocked}
            mode={screen.mode}
          />
          <Stack spacing={2} sx={{ mt: 2 }}>
            {screen.overLimit > 0 ? (
              <Alert severity="warning">
                {t('tooMany', {
                  max: screen.maxItems,
                  over: screen.overLimit,
                })}
              </Alert>
            ) : null}
            {screen.error ? <Alert>{screen.error}</Alert> : null}
          </Stack>
          <MatchDialog
            open={screen.swapOpen}
            name={screen.swapName}
            onSelect={screen.changeMatch}
            onClose={screen.closeSwap}
          />
          <ReviewActionBar
            saveLabel={saveLabel}
            canSave={screen.canSave}
            onSave={screen.save}
            onDiscard={screen.discard}
          />
        </Box>
      )}
    </>
  );
}
