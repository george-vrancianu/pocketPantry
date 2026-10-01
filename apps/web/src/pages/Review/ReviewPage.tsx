import { Alert, Button, Stack, Typography } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { AppScreenHeader } from '../../components/AppScreenHeader';
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

  if (!screen.hadDraft) return <Navigate to="/scan" replace />;

  return (
    <>
      <AppScreenHeader title={t('title')} />
      {screen.lines.length === 0 ? (
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
                onChange={(patch) => screen.change(line.key, patch)}
                onChangeMatch={(match) => screen.changeMatch(line.key, match)}
                onDrop={() => screen.drop(line.key)}
              />
            ))}
          </Stack>
          {screen.error ? <Alert>{screen.error}</Alert> : null}
          <Stack direction="row" spacing={1}>
            <Button onClick={screen.save} disabled={!screen.canSave}>
              {screen.saving
                ? t('saving')
                : t('save', { count: screen.lines.length })}
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
