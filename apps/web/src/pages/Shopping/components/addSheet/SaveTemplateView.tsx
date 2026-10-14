import {
  Alert,
  BookmarkIcon,
  Box,
  Button,
  TextField,
  Typography,
  tokens,
  radius,
} from '@pocket-pantry/ui';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { translateApiError } from '../../../../i18n/translateApiError';
import { useShoppingList, type ShoppingItem } from '../../../../lib/shopping';
import {
  MAX_TEMPLATES,
  useTemplateMutations,
  useTemplates,
} from '../../../../lib/shoppingTemplates';
import { BackButton } from './BackButton';
import { SheetFooter, TOAST_ABOVE_SHEET, useSheetToast } from './SheetFooter';

export type SaveTemplateViewProps = {
  /** Back to the list of templates; also where a successful save returns. */
  onBack: () => void;
};

/**
 * The Templates tab's save view: names the Shopping List and saves every item
 * on it, checked ones too, as a Shopping Template.
 */
export function SaveTemplateView({ onBack }: SaveTemplateViewProps) {
  const { t, i18n } = useTranslation(['templates', 'common', 'errors']);
  const toast = useSheetToast();
  const navigate = useNavigate();
  const shoppingList = useShoppingList(i18n.language);
  const templates = useTemplates(i18n.language);
  const { createFromList } = useTemplateMutations(i18n.language);
  const [name, setName] = useState('');
  const { color } = tokens;

  const items: ShoppingItem[] = (shoppingList.data?.groups ?? []).flatMap(
    (group) => group.items,
  );
  const atLimit = (templates.data?.length ?? 0) >= MAX_TEMPLATES;
  const trimmed = name.trim();
  const canSave =
    trimmed !== '' && items.length > 0 && !createFromList.isPending && !atLimit;

  const amountOf = (item: ShoppingItem) =>
    item.quantity === null
      ? ''
      : item.unit
        ? `${item.quantity} ${t(`common:units.${item.unit}`)}`
        : String(item.quantity);
  const preview = items
    .map((item) => {
      const amount = amountOf(item);
      return amount ? `${item.name} (${amount})` : item.name;
    })
    .join(', ');

  const save = (event?: FormEvent) => {
    event?.preventDefault();
    if (!canSave) return;
    createFromList.mutate(trimmed, {
      onSuccess: (created) => {
        onBack();
        toast.show(t('templates:save.saved', { name: trimmed }), {
          bottom: TOAST_ABOVE_SHEET,
          action: {
            label: t('templates:save.edit'),
            onClick: () => navigate(`/shopping/templates/${created.id}`),
          },
        });
      },
    });
  };

  const footer = (
    <Box sx={{ p: '12px 20px 20px' }}>
      <Button
        fullWidth
        startIcon={<BookmarkIcon size={18} />}
        disabled={!canSave}
        onClick={() => save()}
        sx={{ minHeight: 48, borderRadius: radius.control }}
      >
        {createFromList.isPending
          ? t('templates:save.saving')
          : t('templates:save.submit')}
      </Button>
    </Box>
  );

  return (
    <Box
      component="form"
      onSubmit={save}
      noValidate
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <BackButton label={t('templates:save.back')} onClick={onBack} />
      {createFromList.error ? (
        <Alert>{translateApiError(t, createFromList.error)}</Alert>
      ) : null}
      <Box>
        <TextField
          label={t('templates:save.name')}
          placeholder={t('templates:save.placeholder')}
          value={name}
          onChange={(event) => setName(event.target.value)}
          slotProps={{ htmlInput: { maxLength: 100 } }}
          autoFocus
        />
        {atLimit ? (
          <Typography variant="meta" sx={{ mt: 0.75, color: color.muted }}>
            {t('errors:shopping.template_limit_reached', {
              max: MAX_TEMPLATES,
            })}
          </Typography>
        ) : null}
      </Box>
      <Box component="section">
        <Typography
          component="h3"
          variant="sectionLabel"
          sx={{ mx: 0.5, mb: 1, color: color.muted }}
        >
          {t('templates:save.preview', { count: items.length })}
        </Typography>
        <Box sx={{ fontSize: 13.5, lineHeight: 1.5, color: color.muted }}>
          {preview}
        </Box>
      </Box>
      <SheetFooter>{footer}</SheetFooter>
    </Box>
  );
}
