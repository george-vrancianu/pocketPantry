import {
  Box,
  Stack,
  Typography,
  border,
  color,
  radius,
  tokens,
} from '@pocket-pantry/ui';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { BaseRecipePicker } from '../../../components/BaseRecipePicker';

/** The card around a Card's content under the title on Details. */
const cardSx = {
  p: 2,
  border: `${border.width} solid ${tokens.color.line}`,
  borderRadius: radius.control,
  backgroundColor: color.fieldBg,
};

/**
 * "Base Recipe" card on Details: the closest Bases, Standalone and a search, then what Save will make.
 * `pickedTitle` is the picked base's title, null for Standalone.
 */
export function BaseRecipeCard({
  pickedTitle,
  ...picker
}: { pickedTitle: string | null } & Omit<
  ComponentProps<typeof BaseRecipePicker>,
  'subline'
>) {
  const { t } = useTranslation('recipes');
  return (
    <Stack spacing={1}>
      <Box sx={cardSx}>
        <BaseRecipePicker {...picker} subline={t('family.baseCard.subline')} />
      </Box>
      <Typography variant="caption" color="text.secondary" role="status">
        {pickedTitle
          ? t('family.baseCard.savesVariant', { title: pickedTitle })
          : t('family.baseCard.savesBase')}
      </Typography>
    </Stack>
  );
}

/** Make a Variant: the read-only row naming the Catalog Base the Variant branches from. */
export function VariantOfRow({ title }: { title: string }) {
  const { t } = useTranslation('recipes');
  return (
    <Typography variant="body2">{t('family.variantOf', { title })}</Typography>
  );
}
