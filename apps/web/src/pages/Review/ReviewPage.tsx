import { Alert, Button, Stack, Typography } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { AppScreenHeader } from '../../components/AppScreenHeader';
import { ExcludedLines } from './components/ExcludedLines';
import { ReviewLineCard } from './components/ReviewLineCard';
import { useReviewScreen } from './hooks/useReviewScreen';

/**
 * The Review screen: where a Member confirms, edits, or discards Scan results
 * before anything is saved. Every Scan Mode lands here with the same proposed
 * lines (see `lib/review.ts`).
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

  return (
    <>
      <AppScreenHeader title={t('title')} />
      {screen.lines.length === 0 && screen.excluded.length === 0 ? (
        <Stack spacing={2}>
          <Typography color="text.secondary">{t('empty')}</Typography>
          <Button onClick={screen.discard}>{t('backToScan')}</Button>
        </Stack>
      ) : (
        <Stack spacing={2}>
          <Stack
            component="ul"
            spacing={1.5}
            sx={{ m: 0, p: 0 }}
            aria-label={t('title')}
          >
            {screen.lines.map((line) => (
              <ReviewLineCard
                key={line.key}
                line={line}
                parents={screen.parents}
                shopping={screen.shopping}
                onChange={(patch) => screen.change(line.key, patch)}
                onChangeMatch={(match) => screen.changeMatch(line.key, match)}
                onDrop={() => screen.drop(line.key)}
              />
            ))}
          </Stack>
          <ExcludedLines lines={screen.excluded} onInclude={screen.include} />
          {screen.overLimit > 0 ? (
            <Alert severity="warning">
              {t('tooMany', {
                max: screen.maxItems,
                over: screen.overLimit,
              })}
            </Alert>
          ) : null}
          {screen.error ? <Alert>{screen.error}</Alert> : null}
          <Stack direction="row" spacing={1}>
            <Button onClick={screen.save} disabled={!screen.canSave}>
              {screen.saving
                ? t(screen.shopping ? 'shoppingAdding' : 'saving')
                : t(screen.shopping ? 'shoppingSave' : 'save', {
                    count: screen.lines.length,
                  })}
            </Button>
            <Button variant="text" onClick={screen.discard}>
              {t('discard')}
            </Button>
          </Stack>
        </Stack>
      )}
    </>
  );
}
