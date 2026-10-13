import {
  Box,
  CheckIcon,
  CloseIcon,
  IconButton,
  ListRow,
  Stack,
  tokens,
  Typography,
  useToast,
} from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { IngredientIconSlot } from '../../../components/IngredientIconSlot';
import { StapleToggle } from '../../../components/StapleToggle';
import type { ShoppingGroup, ShoppingItem } from '../../../lib/shopping';

/** Greyed text colour of a checked row, shared by its name and icon. */
const CHECKED_TEXT = tokens.color.checkedText;

export type ShoppingGroupsProps = {
  groups: ShoppingGroup[];
  onToggle: (id: string, checked: boolean) => void;
  onRemove: (id: string, name: string) => void;
};

/** The list grouped by Aisle (shop order is the order the API returns). */
export function ShoppingGroups({
  groups,
  onToggle,
  onRemove,
}: ShoppingGroupsProps) {
  const { t } = useTranslation('shopping');
  return (
    <Stack spacing={2}>
      {groups.map((group) => {
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
                py: 0,
                px: 0.75,
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                borderRadius: '20px',
                overflow: 'hidden',
              }}
            >
              {group.items.map((item) => (
                <ChecklistRow
                  key={item.id}
                  item={item}
                  aisleId={group.aisle?.id}
                  onToggle={onToggle}
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
  aisleId,
  onToggle,
  onRemove,
}: {
  item: ShoppingItem;
  /** The group's Aisle; absent in the Unmatched group. */
  aisleId?: string;
  onToggle: ShoppingGroupsProps['onToggle'];
  onRemove: ShoppingGroupsProps['onRemove'];
}) {
  const { t } = useTranslation('shopping');
  const toast = useToast();
  const quantity =
    item.quantity === null
      ? null
      : item.unit
        ? `${item.quantity} ${t(`common:units.${item.unit}`)}`
        : String(item.quantity);

  return (
    <ListRow
      done={item.checked}
      title={item.name}
      meta={quantity}
      // The whole row is the toggle, as in the handoff.
      wrapMain={(main) => (
        <Box
          component="button"
          type="button"
          aria-pressed={item.checked}
          onClick={() => onToggle(item.id, !item.checked)}
          sx={{
            flexGrow: 1,
            minWidth: 0,
            alignSelf: 'stretch',
            display: 'flex',
            alignItems: 'center',
            minHeight: 40,
            py: 0,
            pr: 0,
            pl: 1.25,
            border: 0,
            bgcolor: 'transparent',
            textAlign: 'left',
            cursor: 'pointer',
            color: 'text.primary',
            font: 'inherit',
          }}
        >
          {main}
        </Box>
      )}
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
                ? { bgcolor: 'primary.main', color: '#FFFFFF' }
                : { border: '2px solid #A7B3AA' }),
            }}
          >
            {item.checked ? <CheckIcon size={16} strokeWidth={2.6} /> : null}
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
                  t(isStaple ? 'item.nowStaple' : 'item.removedFromStaples', {
                    name: item.name,
                  }),
                )
              }
            />
          ) : null}
          <IconButton
            label={t('item.remove', { name: item.name })}
            onClick={() => onRemove(item.id, item.name)}
          >
            <CloseIcon size={18} />
          </IconButton>
        </Box>
      }
    />
  );
}
