import { Box } from '@pocket-pantry/ui';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreditPrice, type CreditPriceKind } from '../lib/credits';

/** "1 Credit" / "2 Credits": a Credit Price in words, for a screen reader or a caption. */
export function useCreditPriceText(kind: CreditPriceKind): string | null {
  const { t } = useTranslation('common');
  const price = useCreditPrice(kind);
  // Nothing to show while loading, and nothing for a read that costs nothing.
  return price ? t('credits.price', { count: price }) : null;
}

/** The Credit Price of a kind of read where it is offered; renders nothing until the price is known. */
export function CreditPrice({
  kind,
  ...rest
}: { kind: CreditPriceKind } & Omit<ComponentProps<typeof Box>, 'children'>) {
  const text = useCreditPriceText(kind);
  return text ? (
    <Box component="span" {...rest}>
      {text}
    </Box>
  ) : null;
}
