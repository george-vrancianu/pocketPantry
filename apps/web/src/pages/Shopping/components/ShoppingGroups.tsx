import {
  Box,
  CheckIcon,
  ListRow,
  Stack,
  SwipeRow,
  tokens,
  type SwipeRowHandle,
  Typography,
  useToast,
} from '@pocket-pantry/ui';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AmountSheet } from '../../../components/AmountSheet';
import { IngredientIconSlot } from '../../../components/IngredientIconSlot';
import type { RowHint } from '../../../lib/useRowHint';
import { useSwipeRowLabels } from '../../../lib/useSwipeRowLabels';
import { StapleToggle } from '../../../components/StapleToggle';
import type { ShoppingGroup, ShoppingItem } from '../../../lib/shopping';

/** Greyed text colour of a checked row, shared by its name and icon. */
const CHECKED_TEXT = tokens.color.checkedText;

export type ShoppingGroupsProps = {
  groups: ShoppingGroup[];
  onToggle: (id: string, checked: boolean) => void;
  onSetAmount: (
    id: string,
    amount: Pick<ShoppingItem, 'quantity' | 'unit'>,
  ) => Promise<unknown>;
  onRemove: (id: string, name: string) => void;
  /** The first-use hint: the first row peeks, and a gesture on any row fades the pill. */
  hint?: Pick<RowHint, 'peek' | 'onLearned'>;
};

/** The list grouped by Aisle (shop order is the order the API returns). */
export function ShoppingGroups({
  groups,
  onToggle,
  onSetAmount,
  onRemove,
  hint,
}: ShoppingGroupsProps) {
  const { t } = useTranslation('shopping');
  return (
    <Stack spacing={2}>
      {groups.map((group, groupIndex) => {
        const title = group.aisle?.name ?? t('unmatchedGroup');
        return (
          <Box
            component="section"
            key={group.aisle?.id ?? 'unmatched'}
            aria-label={title}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                mx: 0.5,
                mb: 1,
              }}
            >
              <Typography
                component="h2"
                variant="sectionLabel"
                color="text.secondary"
              >
                {title}
              </Typography>
              <Typography
                component="span"
                variant="sectionLabel"
                color="text.secondary"
                sx={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {group.items.length}
              </Typography>
            </Box>
            <Box
              component="ul"
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
              {group.items.map((item, itemIndex) => (
                <ChecklistRow
                  key={item.id}
                  item={item}
                  peek={groupIndex === 0 && itemIndex === 0 && !!hint?.peek}
                  onLearned={hint?.onLearned}
                  aisleId={group.aisle?.id}
                  onToggle={onToggle}
                  onSetAmount={onSetAmount}
                  onRemove={onRemove}
                />
              ))}
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}

function ChecklistRow({
  item,
  peek,
  onLearned,
  aisleId,
  onToggle,
  onSetAmount,
  onRemove,
}: {
  item: ShoppingItem;
  peek: boolean;
  onLearned?: () => void;
  /** The group's Aisle; absent in the Unmatched group. */
  aisleId?: string;
  onToggle: ShoppingGroupsProps['onToggle'];
  onSetAmount: ShoppingGroupsProps['onSetAmount'];
  onRemove: ShoppingGroupsProps['onRemove'];
}) {
  const { t } = useTranslation('shopping');
  const toast = useToast();
  const labels = useSwipeRowLabels(item.name, 'list', { hold: true });
  const [editing, setEditing] = useState(false);
  const row = useRef<SwipeRowHandle>(null);

  // "Remove from list" closes the sheet first and asks once it is gone: the sheet hands focus back to the
  // row as it closes, and the confirmation's Keep button must be focused after that, not before.
  const [askAfterClose, setAskAfterClose] = useState(false);
  useEffect(() => {
    if (!askAfterClose || editing) return;
    setAskAfterClose(false);
    row.current?.askToRemove();
  }, [askAfterClose, editing]);
  const quantity =
    item.quantity === null
      ? null
      : item.unit
        ? `${item.quantity} ${t(`common:units.${item.unit}`)}`
        : String(item.quantity);

  return (
    <>
      <SwipeRow
        ref={row}
        name={item.name}
        labels={labels}
        disabled={editing}
        peek={peek}
        onLearned={onLearned}
        pressed={item.checked}
        onEdit={() => setEditing(true)}
        onTap={() => onToggle(item.id, !item.checked)}
        onRemove={() => onRemove(item.id, item.name)}
      >
        <ListRow
          done={item.checked}
          title={item.name}
          meta={quantity}
          leading={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                aria-hidden="true"
                sx={{
                  flexShrink: 0,
                  width: 24,
                  height: 24,
                  boxSizing: 'border-box',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...(item.checked
                    ? { bgcolor: 'primary.main', color: tokens.color.surface }
                    : { border: `2px solid ${tokens.color.tickBorder}` }),
                }}
              >
                {item.checked ? (
                  <CheckIcon size={16} strokeWidth={2.6} />
                ) : null}
              </Box>
              <IngredientIconSlot
                ingredientId={item.ingredientId}
                aisleId={aisleId}
                color={item.checked ? CHECKED_TEXT : 'text.primary'}
              />
            </Box>
          }
          tags={
            item.unmatched ? (
              <Typography
                component="span"
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'primary.main',
                  bgcolor: 'primary.light',
                  px: 1,
                  py: 0.5,
                  borderRadius: 999,
                }}
              >
                {t('item.unmatched')}
              </Typography>
            ) : null
          }
          trailing={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {item.ingredientId !== null ? (
                <StapleToggle
                  ingredientId={item.ingredientId}
                  name={item.name}
                  onToggled={(isStaple) =>
                    toast.show(
                      t(
                        isStaple ? 'item.nowStaple' : 'item.removedFromStaples',
                        {
                          name: item.name,
                        },
                      ),
                    )
                  }
                />
              ) : null}
            </Box>
          }
        />
      </SwipeRow>
      <AmountSheet
        open={editing}
        name={item.name}
        context={t('common:row.context.list')}
        amount={{ quantity: item.quantity, unit: item.unit }}
        onSave={async (amount) => {
          await onSetAmount(item.id, amount);
          setEditing(false);
          toast.show(t('common:row.updated', { name: item.name }));
        }}
        onClose={() => setEditing(false)}
        removeLabel={t('common:edit.removeFromList')}
        onRemove={() => {
          setEditing(false);
          setAskAfterClose(true);
        }}
      />
    </>
  );
}
