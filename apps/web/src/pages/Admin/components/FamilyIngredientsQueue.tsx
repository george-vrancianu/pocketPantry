import { Alert, Button, Spinner, Stack, Typography } from '@pocket-pantry/ui';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import {
  useFamilyIngredientsQueue,
  type FamilyIngredientGroup,
} from '../../../lib/familyIngredientsQueue';
import { FamilyIngredientPromote } from './FamilyIngredientPromote';

/**
 * The Admin queue of Family Ingredients: one row per normalised name across
 * Families, most owned first. Promote opens a picker of the copies.
 */
export function FamilyIngredientsQueue() {
  const { t } = useTranslation(['admin', 'common']);
  const queue = useFamilyIngredientsQueue(true);
  const [promoting, setPromoting] = useState<FamilyIngredientGroup | null>(
    null,
  );
  const [notice, setNotice] = useState<string | null>(null);
  const noticeRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  // Where focus goes once the picker closes: back to the row, or to the result message.
  const [restoreFocus, setRestoreFocus] = useState<
    { to: 'row'; name: string } | { to: 'notice' } | null
  >(null);

  useEffect(() => {
    if (promoting || !restoreFocus) return;
    if (restoreFocus.to === 'notice') {
      noticeRef.current?.focus();
    } else {
      const buttons =
        listRef.current?.querySelectorAll<HTMLElement>('[data-promote-for]');
      [...(buttons ?? [])]
        .find((button) => button.dataset.promoteFor === restoreFocus.name)
        ?.focus();
    }
    setRestoreFocus(null);
  }, [promoting, restoreFocus, queue.data]);

  if (promoting) {
    return (
      <FamilyIngredientPromote
        group={promoting}
        onDone={(result) => {
          setPromoting(null);
          setNotice(
            t('admin:familyIngredients.promoted', {
              name: result.name,
              count: result.mergedIngredientIds.length,
            }),
          );
          setRestoreFocus({ to: 'notice' });
        }}
        onCancel={() => {
          setRestoreFocus({ to: 'row', name: promoting.normalizedName });
          setPromoting(null);
        }}
      />
    );
  }

  const groups = queue.data ?? [];
  return (
    <Stack spacing={2}>
      {/* A polite live region so the result of a promote is announced. */}
      <div role="status" ref={noticeRef} tabIndex={-1}>
        {notice ? <Typography variant="body2">{notice}</Typography> : null}
      </div>
      {queue.error ? <Alert>{translateApiError(t, queue.error)}</Alert> : null}
      {queue.isPending ? <Spinner label={t('common:loading')} /> : null}
      {queue.isSuccess && groups.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t('admin:familyIngredients.empty')}
        </Typography>
      ) : null}
      <Stack
        component="ul"
        ref={listRef}
        spacing={2}
        sx={{ m: 0, p: 0, listStyle: 'none' }}
      >
        {groups.map((group) => (
          <li key={group.normalizedName}>
            <Stack spacing={1}>
              <Typography component="h3" variant="subtitle1">
                {group.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('admin:familyIngredients.families', {
                  count: group.familyCount,
                })}{' '}
                · {group.leafCategory.name} ·{' '}
                {t(`admin:locales.${group.locale}`)}
              </Typography>
              <div>
                <Button
                  aria-label={t('admin:familyIngredients.promoteName', {
                    name: group.name,
                  })}
                  data-promote-for={group.normalizedName}
                  onClick={() => {
                    setNotice(null);
                    setPromoting(group);
                  }}
                >
                  {t('admin:familyIngredients.promote')}
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
            void queue.fetchNextPage();
          }}
        >
          {t('admin:unmatched.loadMore')}
        </Button>
      ) : null}
    </Stack>
  );
}
