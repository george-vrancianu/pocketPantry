import {
  Alert,
  BackIcon,
  Box,
  Button,
  CheckIcon,
  PlusIcon,
  Spinner,
  Typography,
  tokens,
  useToast,
} from '@pocket-pantry/ui';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../../i18n/translateApiError';
import { useShoppingList } from '../../../../lib/shopping';
import { focusRing } from './focusRing';
import {
  groupByAisle,
  useApplyTemplate,
  useTemplate,
  type TemplateLine,
} from '../../../../lib/shoppingTemplates';

export type ApplyTemplateViewProps = {
  templateId: string;
  /** Back to the list of templates. */
  onBack: () => void;
  /** Closes the sheet after the lines are added. */
  onApplied: () => void;
  /** Where the sticky footer renders, once the sheet has made room for it. */
  footerHost: HTMLElement | null;
  /** Tells the sheet whether this view has a footer to make room for. */
  onFooterWanted: (wanted: boolean) => void;
};

const normalise = (name: string) => name.trim().toLowerCase();

/**
 * The Templates tab's apply view. Ingredients in the Pantry start unticked, all
 * other lines ticked; only the ticked lines are added.
 */
export function ApplyTemplateView({
  templateId,
  onBack,
  onApplied,
  footerHost,
  onFooterWanted,
}: ApplyTemplateViewProps) {
  const { t, i18n } = useTranslation(['templates', 'common']);
  const toast = useToast();
  const template = useTemplate(templateId, i18n.language);
  const shoppingList = useShoppingList(i18n.language);
  const apply = useApplyTemplate(i18n.language);
  // Only the lines the Member has flipped; every other line keeps its default.
  const [flipped, setFlipped] = useState<ReadonlySet<string>>(new Set());
  const { color } = tokens;
  const loaded = Boolean(template.data);
  useEffect(() => {
    onFooterWanted(loaded);
    return () => onFooterWanted(false);
  }, [loaded, onFooterWanted]);

  const back = (
    <Box
      component="button"
      type="button"
      onClick={onBack}
      sx={{
        mb: 1.5,
        p: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        border: 0,
        background: 'none',
        color: color.accent,
        font: 'inherit',
        fontSize: 14,
        fontWeight: 700,
        cursor: 'pointer',
        ...focusRing,
      }}
    >
      <BackIcon size={16} aria-hidden />
      {t('templates:apply.allTemplates')}
    </Box>
  );

  if (template.isPending) return <Spinner label={t('common:loading')} />;
  if (template.error || !template.data) {
    return (
      <Box>
        {back}
        <Alert>{translateApiError(t, template.error)}</Alert>
      </Box>
    );
  }

  const { name, lines } = template.data;
  const isTicked = (line: TemplateLine) =>
    !line.inPantry !== flipped.has(line.id);
  const ticked = lines.filter(isTicked);

  // Unchecked items already on the list, by Ingredient and by Unmatched name.
  const unchecked = (shoppingList.data?.groups ?? [])
    .flatMap((group) => group.items)
    .filter((item) => !item.checked);
  const onListIds = new Set(unchecked.map((item) => item.ingredientId));
  const onListNames = new Set(
    unchecked
      .filter((item) => !item.ingredientId)
      .map((item) => normalise(item.name)),
  );
  const isOnList = (line: TemplateLine) =>
    line.ingredientId
      ? onListIds.has(line.ingredientId)
      : onListNames.has(normalise(line.name));

  const toggle = (id: string) =>
    setFlipped((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  const submit = () =>
    apply.mutate(ticked, {
      onSuccess: () => {
        onApplied();
        toast.show(t('templates:apply.added', { count: ticked.length, name }));
      },
    });

  const amountOf = (line: TemplateLine) =>
    line.quantity === null
      ? ''
      : line.unit
        ? `${line.quantity} ${t(`common:units.${line.unit}`)}`
        : String(line.quantity);

  const footer = (
    <Box sx={{ p: '12px 20px 20px' }}>
      <Button
        fullWidth
        startIcon={<PlusIcon size={18} />}
        disabled={ticked.length === 0 || apply.isPending}
        onClick={submit}
        sx={{ minHeight: 48, borderRadius: '16px' }}
      >
        {apply.isPending
          ? t('templates:apply.confirming')
          : t('templates:apply.confirm', { count: ticked.length })}
      </Button>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box>
        {back}
        <Typography
          component="h3"
          sx={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          {name}
        </Typography>
        <Typography variant="meta" sx={{ color: color.muted }}>
          {t('templates:apply.hint')}
        </Typography>
      </Box>
      {apply.error ? <Alert>{translateApiError(t, apply.error)}</Alert> : null}
      {lines.length === 0 ? (
        <Typography>{t('templates:apply.empty')}</Typography>
      ) : null}
      {groupByAisle(lines).map((group) => (
        <Box component="section" key={group.key}>
          <Typography
            component="h4"
            variant="sectionLabel"
            sx={{ mx: 0.5, mb: 1, color: color.muted }}
          >
            {group.title ?? t('templates:apply.unmatchedGroup')}
          </Typography>
          <Box
            sx={{
              borderRadius: '20px',
              border: `1px solid ${color.line}`,
              backgroundColor: color.surface,
            }}
          >
            {group.lines.map((line) => {
              const tag = line.inPantry
                ? { text: t('templates:apply.inPantry'), ...okTag }
                : isOnList(line)
                  ? { text: t('templates:apply.onList'), ...soonTag }
                  : null;
              const amount = amountOf(line);
              const on = isTicked(line);
              return (
                <Box
                  key={line.id}
                  role="checkbox"
                  aria-checked={on}
                  tabIndex={0}
                  onClick={() => toggle(line.id)}
                  onKeyDown={(event: React.KeyboardEvent) => {
                    if (event.key === ' ' || event.key === 'Enter') {
                      event.preventDefault();
                      toggle(line.id);
                    }
                  }}
                  sx={{
                    minHeight: 50,
                    p: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    cursor: 'pointer',
                    '& + &': { borderTop: `1px solid ${color.divider}` },
                    ...focusRing,
                  }}
                >
                  <Box
                    aria-hidden
                    sx={{
                      flexShrink: 0,
                      width: 24,
                      height: 24,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: '8px',
                      border: `2px solid ${on ? color.accent : '#A7B3AA'}`,
                      backgroundColor: on ? color.accent : 'transparent',
                      color: '#FFFFFF',
                    }}
                  >
                    {on ? <CheckIcon size={14} /> : null}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ fontSize: 15, fontWeight: 600 }}>
                      {line.name}
                    </Box>
                    {amount ? (
                      <Box
                        sx={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: color.muted,
                        }}
                      >
                        {amount}
                      </Box>
                    ) : null}
                  </Box>
                  {tag ? (
                    <Box
                      component="span"
                      sx={{
                        px: 1.25,
                        py: 0.25,
                        borderRadius: 999,
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: tag.fg,
                        backgroundColor: tag.bg,
                      }}
                    >
                      {tag.text}
                    </Box>
                  ) : null}
                </Box>
              );
            })}
          </Box>
        </Box>
      ))}
      {footerHost ? createPortal(footer, footerHost) : null}
    </Box>
  );
}

const okTag = { fg: tokens.color.okFg, bg: tokens.color.okBg };
const soonTag = { fg: tokens.color.soonFg, bg: tokens.color.soonBg };
