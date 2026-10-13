import {
  Alert,
  Box,
  Link,
  ListRow,
  Spinner,
  Stack,
  SwipeRow,
  Typography,
  useToast,
  type SwipeRowHandle,
} from '@pocket-pantry/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AmountSheet } from '../../components/AmountSheet';
import { AppScreenHeader } from '../../components/AppScreenHeader';
import { CatalogSearch } from '../../components/CatalogSearch';
import { translateApiError } from '../../i18n/translateApiError';
import { formatAmount } from '../../lib/amount';
import {
  staplesQueryKey,
  useStapleMutations,
  useStaples,
  type Staple,
} from '../../lib/staples';
import { useDeferredRemoval } from '../../lib/useDeferredRemoval';
import { useRowHint, type RowHint } from '../../lib/useRowHint';
import { useSwipeRowLabels } from '../../lib/useSwipeRowLabels';
import { RowHintNote } from '../../components/RowHintNote';

/** The Family's Staples: add by Catalog search, set a preferred quantity and unit, or remove. */
export function StaplesPage() {
  const { t, i18n } = useTranslation(['staples', 'common']);
  const staples = useStaples(i18n.language);
  const { add, update, remove } = useStapleMutations(i18n.language);
  const [formKey, setFormKey] = useState(0);
  const queryClient = useQueryClient();
  const { mutateAsync: sendDelete } = remove;
  const removal = useDeferredRemoval(
    useCallback(
      async (id: string) => {
        // A poll already in flight would carry the Staple back in.
        await queryClient.cancelQueries({ queryKey: staplesQueryKey });
        return sendDelete(id);
      },
      [queryClient, sendDelete],
    ),
  );
  // A removed Staple stays out of the list, refetches included, until its delete has settled.
  const visible = useMemo(
    () => staples.data?.filter((staple) => !removal.hiddenIds.has(staple.id)),
    [staples.data, removal.hiddenIds],
  );

  const hint = useRowHint('staples', (visible?.length ?? 0) > 0);

  // A failed save is shown by the amount sheet and a failed removal by its toast.
  const error = staples.error ?? add.error;

  return (
    <>
      <AppScreenHeader
        title={t('staples:title')}
        trailing={<Link href="/shopping">{t('staples:back')}</Link>}
      />
      <RowHintNote hint={hint} />
      <Stack spacing={2}>
        <Typography color="text.secondary">{t('staples:hint')}</Typography>
        {error ? <Alert>{translateApiError(t, error)}</Alert> : null}
        <CatalogSearch
          key={formKey}
          onSelect={(ingredient) =>
            add.mutate(
              { ingredientId: ingredient.id },
              { onSettled: () => setFormKey((key) => key + 1) },
            )
          }
        />
        {staples.isPending ? <Spinner label={t('common:loading')} /> : null}
        {visible?.length === 0 ? (
          <Typography color="text.secondary">{t('staples:empty')}</Typography>
        ) : null}
        {visible && visible.length > 0 ? (
          <Box
            component="ul"
            aria-label={t('staples:listLabel')}
            sx={{
              listStyle: 'none',
              m: 0,
              p: 0,
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              borderRadius: '20px',
              overflow: 'hidden',
            }}
          >
            {visible.map((staple, index) => (
              <StapleRow
                key={staple.id}
                staple={staple}
                peek={index === 0 && hint.peek}
                onLearned={hint.onLearned}
                onSave={(amount) =>
                  update.mutateAsync({ id: staple.id, ...amount })
                }
                onRemove={() => removal.remove(staple.id, staple.name)}
              />
            ))}
          </Box>
        ) : null}
      </Stack>
    </>
  );
}

function StapleRow({
  staple,
  peek,
  onLearned,
  onSave,
  onRemove,
}: {
  staple: Staple;
  peek: boolean;
  onLearned: RowHint['onLearned'];
  /** Rejects with the API error, which the amount sheet shows. */
  onSave: (amount: Pick<Staple, 'quantity' | 'unit'>) => Promise<unknown>;
  onRemove: () => void;
}) {
  const { t, i18n } = useTranslation(['staples', 'common']);
  const toast = useToast();
  const labels = useSwipeRowLabels(staple.name, 'staples', { hold: true });
  const [editing, setEditing] = useState(false);
  const row = useRef<SwipeRowHandle>(null);

  // "Remove Staple" closes the sheet first and asks once it is gone: the sheet hands focus back to the
  // row as it closes, and the confirmation's Keep button must be focused after that, not before.
  const [askAfterClose, setAskAfterClose] = useState(false);
  useEffect(() => {
    if (!askAfterClose || editing) return;
    setAskAfterClose(false);
    row.current?.askToRemove();
  }, [askAfterClose, editing]);

  return (
    <>
      <SwipeRow
        ref={row}
        name={staple.name}
        labels={labels}
        disabled={editing}
        peek={peek}
        onLearned={onLearned}
        onEdit={() => setEditing(true)}
        onRemove={onRemove}
      >
        <ListRow
          title={staple.name}
          meta={
            staple.quantity !== null && staple.unit
              ? formatAmount(staple.quantity, staple.unit, i18n.language, t)
              : null
          }
        />
      </SwipeRow>
      <AmountSheet
        open={editing}
        name={staple.name}
        context={t('common:row.context.staples')}
        amount={{ quantity: staple.quantity, unit: staple.unit }}
        requireUnit
        onSave={async (amount) => {
          await onSave(amount);
          setEditing(false);
          toast.show(t('common:row.updated', { name: staple.name }));
        }}
        onClose={() => setEditing(false)}
        removeLabel={t('common:edit.removeStaple')}
        onRemove={() => {
          setEditing(false);
          setAskAfterClose(true);
        }}
      />
    </>
  );
}
