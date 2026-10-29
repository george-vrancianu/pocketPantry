import {
  Box,
  Button,
  CloseIcon,
  IconButton,
  Sheet,
  Stack,
  Typography,
  tokens,
} from '@pocket-pantry/ui';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IngredientIconSlot } from '../../../components/IngredientIconSlot';
import { RemoveLink } from '../../../components/RemoveLink';
import type { FamilyCatalogSynonym } from '../../../lib/familyCatalog';

export type FamilySynonymSheetProps = {
  open: boolean;
  synonym: FamilyCatalogSynonym;
  onClose: () => void;
  onExited: () => void;
  /** "Remove this name": the sheet closes itself, then the caller asks to remove the row. */
  onRemove: () => void;
};

/** A Family Synonym of a shared Catalog Ingredient, read-only: to point it elsewhere, remove and add it again. */
export function FamilySynonymSheet({
  open,
  synonym,
  onClose,
  onExited,
  onRemove,
}: FamilySynonymSheetProps) {
  const { t } = useTranslation(['settings', 'common']);
  const removeRequested = useRef(false);
  const meta = t('settings:familyCatalog.synonymMeta', {
    ingredient: synonym.ingredient.name,
  });
  return (
    <Sheet
      open={open}
      onClose={onClose}
      onExited={() => {
        onExited();
        if (!removeRequested.current) return;
        removeRequested.current = false;
        onRemove();
      }}
      label={`“${synonym.name}”`}
      size="content"
      header={
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 3,
            pt: 2,
            pb: 1,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              component="h2"
              sx={{ fontSize: 20, fontWeight: 700, overflowWrap: 'anywhere' }}
            >
              {`“${synonym.name}”`}
            </Typography>
            <Typography variant="meta" color="text.secondary">
              {meta}
            </Typography>
          </Box>
          <IconButton
            label={t('settings:defaultExpiry.close')}
            size={40}
            onClick={onClose}
          >
            <CloseIcon size={18} />
          </IconButton>
        </Box>
      }
    >
      <Stack spacing={2} sx={{ px: 3, pt: 1, pb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            borderRadius: 2,
            bgcolor: tokens.color.subtle,
          }}
        >
          <IngredientIconSlot ingredientId={synonym.ingredient.id} />
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 600 }}>
              {synonym.ingredient.name}
            </Typography>
            <Typography variant="meta" color="text.secondary">
              {t('settings:familyCatalog.inCatalog')}
            </Typography>
          </Box>
        </Box>
        <Typography variant="meta" color="text.secondary">
          {t('settings:familyCatalog.synonymInfo', {
            name: synonym.name,
            ingredient: synonym.ingredient.name,
          })}
        </Typography>
        <Button onClick={onClose}>{t('settings:familyCatalog.done')}</Button>
        <RemoveLink
          onClick={() => {
            removeRequested.current = true;
            onClose();
          }}
        >
          {t('settings:familyCatalog.synonymRemoveLink')}
        </RemoveLink>
      </Stack>
    </Sheet>
  );
}
