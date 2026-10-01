import {
  Box,
  CheckIcon,
  CloseIcon,
  IconButton,
  Stack,
  Typography,
} from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import type { ShoppingGroup, ShoppingItem } from '../../../lib/shopping';

export type ShoppingGroupsProps = {
  groups: ShoppingGroup[];
  onToggle: (id: string, checked: boolean) => void;
  onRemove: (id: string) => void;
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
            <Typography
              component="h2"
              variant="sectionLabel"
              color="text.secondary"
              sx={{ mx: 0.5, mb: 1 }}
            >
              {title}
            </Typography>
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
  onToggle,
  onRemove,
}: {
  item: ShoppingItem;
  onToggle: ShoppingGroupsProps['onToggle'];
  onRemove: ShoppingGroupsProps['onRemove'];
}) {
  const { t } = useTranslation('shopping');
  const quantity =
    item.quantity === null
      ? null
      : item.unit
        ? `${item.quantity} ${t(`units.${item.unit}`)}`
        : String(item.quantity);

  return (
    <Box
      component="li"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        '& + &': { borderTop: 1, borderColor: 'divider' },
      }}
    >
      {/* The whole row is the toggle, as in the handoff. */}
      <Box
        component="button"
        type="button"
        aria-pressed={item.checked}
        onClick={() => onToggle(item.id, !item.checked)}
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          minHeight: 50,
          px: 1.25,
          border: 0,
          bgcolor: 'transparent',
          textAlign: 'left',
          cursor: 'pointer',
          color: 'text.primary',
          font: 'inherit',
        }}
      >
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
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography
            component="span"
            sx={{
              display: 'block',
              fontSize: 15,
              fontWeight: item.checked ? 500 : 600,
              ...(item.checked
                ? { textDecoration: 'line-through', color: '#66736B' }
                : {}),
            }}
          >
            {item.name}
          </Typography>
          {quantity ? (
            <Typography
              component="span"
              variant="meta"
              color="text.secondary"
              sx={{ display: 'block' }}
            >
              {quantity}
            </Typography>
          ) : null}
        </Box>
        {item.unmatched ? (
          <Typography
            component="span"
            sx={{
              flexShrink: 0,
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
        ) : null}
      </Box>
      <IconButton
        label={t('item.remove', { name: item.name })}
        onClick={() => onRemove(item.id)}
      >
        <CloseIcon size={18} />
      </IconButton>
    </Box>
  );
}
