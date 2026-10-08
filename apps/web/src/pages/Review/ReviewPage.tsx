import {
  Alert,
  Box,
  Button,
  Stack,
  Typography,
  useBreakpointUp,
} from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { AppScreenHeader } from '../../components/AppScreenHeader';
import { MatchDialog } from './components/MatchDialog';
import { ReviewActionBar } from './components/ReviewActionBar';
import { ReviewCounters } from './components/ReviewCounters';
import { ReviewTable } from './components/ReviewTable';
import {
  ReviewCounterChips,
  ReviewTabletFooter,
} from './components/ReviewTabletChrome';
import { TabletReviewTable } from './components/TabletReviewTable';
import { useReviewScreen } from './hooks/useReviewScreen';

/**
 * The Review screen: where a Member confirms, edits, or discards Scan results
 * before anything is saved. Every Scan Mode lands here with the same proposed
 * lines (see `lib/review.ts`). Lines to check sort to the top, already open;
 * confident ones are single rows. Below 900 px it is the phone layout; from
 * 900 px a wide table with the same state, handlers and groups.
 */
export function ReviewPage() {
  const { t } = useTranslation('review');
  const screen = useReviewScreen();
  const wide = useBreakpointUp('md');

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

  const notices = (
    <>
      {screen.overLimit > 0 ? (
        <Alert severity="warning">
          {t('tooMany', {
            max: screen.maxItems,
            over: screen.overLimit,
          })}
        </Alert>
      ) : null}
      {screen.error ? <Alert>{screen.error}</Alert> : null}
    </>
  );

  if (wide) {
    return (
      <>
        <AppScreenHeader
          title={t('title')}
          subtitle={subtitle}
          trailing={read === 0 ? null : <ReviewCounterChips {...counts} />}
        />
        {read === 0 ? (
          <Stack spacing={2}>
            <Typography color="text.secondary">{t('empty')}</Typography>
            <Button onClick={screen.discard}>{t('backToScan')}</Button>
          </Stack>
        ) : (
          <>
            <TabletReviewTable
              state={screen.state}
              groups={groups}
              parents={screen.parents}
              shopping={screen.shopping}
              mode={screen.mode}
              blocked={screen.blocked}
              onOpen={screen.open}
              onToggle={screen.toggle}
              onChange={screen.change}
              onSwapMatch={screen.openSwap}
              onRemove={screen.remove}
              onConfirm={screen.confirm}
              onRestore={screen.restore}
              onToggleSureGroup={screen.toggleSureGroup}
            />
            <Stack spacing={2} sx={{ mt: 2 }}>
              {notices}
            </Stack>
            <MatchDialog
              open={screen.swapOpen}
              name={screen.swapName}
              onSelect={screen.changeMatch}
              onClose={screen.closeSwap}
            />
            <ReviewTabletFooter
              saveLabel={saveLabel}
              canSave={screen.canSave}
              onSave={screen.save}
              onDiscard={screen.discard}
            />
          </>
        )}
      </>
    );
  }

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
            {notices}
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
