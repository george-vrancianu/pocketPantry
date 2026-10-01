import { Box, ShoppingIcon, tokens } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import { firstUncheckedNames } from '../../../lib/dashboard';
import { useShoppingList } from '../../../lib/shopping';
import { WidgetCard, WidgetTitle } from './WidgetCard';
import type { WidgetProps } from './types';

/** Unchecked Shopping Items on the butter card: the count and the first few names. */
export function ShoppingWidget({ size, columns }: WidgetProps) {
  const { t, i18n } = useTranslation('dashboard');
  const list = useShoppingList(i18n.language);
  const { names, hasMore } = list.data
    ? firstUncheckedNames(list.data)
    : { names: [], hasMore: false };

  return (
    <WidgetCard
      label={t('widgets.shopping.title')}
      size={size}
      columns={columns}
      tone="butter"
      to="/shopping"
      isLoading={list.isPending}
      error={list.error ? translateApiError(t, list.error) : null}
    >
      <WidgetTitle
        icon={<ShoppingIcon size={16} />}
        color={tokens.color.butterInk}
      >
        {t('widgets.shopping.title')}
      </WidgetTitle>
      <Box
        component="p"
        sx={{
          m: 0,
          mt: '8px',
          fontFamily: tokens.font.display,
          fontSize: 40,
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        {list.data?.summary.remaining ?? 0}
      </Box>
      <Box
        component="p"
        sx={{ m: 0, mt: '2px', fontSize: 13, fontWeight: 600 }}
      >
        {t('widgets.shopping.itemsToBuy', {
          count: list.data?.summary.remaining ?? 0,
        })}
      </Box>
      <Box
        component="p"
        sx={{
          m: 0,
          mt: 'auto',
          pt: '8px',
          fontSize: 12,
          color: tokens.color.butterInk,
        }}
      >
        {names.length === 0
          ? t('widgets.shopping.empty')
          : `${names.join(', ')}${hasMore ? '…' : ''}`}
      </Box>
    </WidgetCard>
  );
}
