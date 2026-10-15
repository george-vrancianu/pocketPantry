import { Alert, Button, Spinner, Stack, Typography } from '@pocket-pantry/ui';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import {
  useFamilySynonymsQueue,
  type FamilySynonymCandidate,
} from '../../../lib/familySynonymsQueue';
import { FamilySynonymAdd } from './FamilySynonymAdd';

const keyOf = (candidate: FamilySynonymCandidate) =>
  `${candidate.normalizedName}|${candidate.ingredient.id}`;

/**
 * The Admin queue of Family Synonyms: one row per (name, Ingredient) across
 * Families, most owned first. Add opens a form for the shared Synonym's language.
 */
export function FamilySynonymsQueue() {
  const { t } = useTranslation(['admin', 'common']);
  const queue = useFamilySynonymsQueue(true);
  const [adding, setAdding] = useState<FamilySynonymCandidate | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const noticeRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  // Where focus goes once the form closes: back to the row, or to the result message.
  const [restoreFocus, setRestoreFocus] = useState<
    { to: 'row'; key: string } | { to: 'notice' } | null
  >(null);
  // Index of the first row a Load more brings in, until focus has moved there.
  const [focusFrom, setFocusFrom] = useState<number | null>(null);

  useEffect(() => {
    if (focusFrom === null || queue.isFetchingNextPage) return;
    const buttons =
      listRef.current?.querySelectorAll<HTMLElement>('[data-add-for]');
    buttons?.[focusFrom]?.focus();
    setFocusFrom(null);
  }, [focusFrom, queue.isFetchingNextPage]);

  useEffect(() => {
    if (adding || !restoreFocus) return;
    if (restoreFocus.to === 'notice') {
      noticeRef.current?.focus();
    } else {
      const buttons =
        listRef.current?.querySelectorAll<HTMLElement>('[data-add-for]');
      [...(buttons ?? [])]
        .find((button) => button.dataset.addFor === restoreFocus.key)
        ?.focus();
    }
    setRestoreFocus(null);
  }, [adding, restoreFocus, queue.data]);

  if (adding) {
    return (
      <FamilySynonymAdd
        candidate={adding}
        onDone={() => {
          setAdding(null);
          setNotice(
            t('admin:familySynonyms.added', {
              name: adding.name,
              ingredient: adding.ingredient.name,
            }),
          );
          setRestoreFocus({ to: 'notice' });
        }}
        onCancel={() => {
          setRestoreFocus({ to: 'row', key: keyOf(adding) });
          setAdding(null);
        }}
      />
    );
  }

  const candidates = queue.data ?? [];
  return (
    <Stack spacing={2}>
      {/* A polite live region so the result is announced. */}
      <div role="status" ref={noticeRef} tabIndex={-1}>
        {notice ? <Typography variant="body2">{notice}</Typography> : null}
      </div>
      {queue.error ? <Alert>{translateApiError(t, queue.error)}</Alert> : null}
      {queue.isPending ? <Spinner label={t('common:loading')} /> : null}
      {queue.isSuccess && candidates.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t('admin:familySynonyms.empty')}
        </Typography>
      ) : null}
      <Stack
        component="ul"
        ref={listRef}
        spacing={2}
        sx={{ m: 0, p: 0, listStyle: 'none' }}
      >
        {candidates.map((candidate) => (
          <li key={keyOf(candidate)}>
            <Stack spacing={1}>
              <Typography component="h3" variant="subtitle1">
                {candidate.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('admin:familyIngredients.families', {
                  count: candidate.familyCount,
                })}{' '}
                ·{' '}
                {t('admin:familySynonyms.of', {
                  ingredient: candidate.ingredient.name,
                })}
              </Typography>
              <div>
                <Button
                  aria-label={t('admin:familySynonyms.addName', {
                    name: candidate.name,
                  })}
                  data-add-for={keyOf(candidate)}
                  onClick={() => {
                    setNotice(null);
                    setAdding(candidate);
                  }}
                >
                  {t('admin:familySynonyms.add')}
                </Button>
              </div>
            </Stack>
          </li>
        ))}
      </Stack>
      {queue.hasNextPage ? (
        <Button
          variant="secondary"
          aria-disabled={queue.isFetchingNextPage}
          onClick={() => {
            if (queue.isFetchingNextPage) return;
            setFocusFrom(candidates.length);
            void queue.fetchNextPage();
          }}
        >
          {t('admin:unmatched.loadMore')}
        </Button>
      ) : null}
    </Stack>
  );
}
