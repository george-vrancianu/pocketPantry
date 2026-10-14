import {
  Alert,
  Box,
  Button,
  CheckIcon,
  PlusIcon,
  Spinner,
  Typography,
  tokens,
  useToast,
  color,
  displayType,
  radius,
  insetFocusRing,
} from '@pocket-pantry/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../../i18n/translateApiError';
import {
  isOnList,
  uncheckedItems,
  useShoppingList,
} from '../../../../lib/shopping';
import { BackButton } from './BackButton';
import { SheetFooter } from './SheetFooter';
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
};

/**
 * The Templates tab's apply view. Ingredients in the Pantry start unticked, all
 * other lines ticked; only the ticked lines are added.
 */
export function ApplyTemplateView({
  templateId,
  onBack,
  onApplied,
}: ApplyTemplateViewProps) {
  const { t, i18n } = useTranslation(['templates', 'common']);
  const toast = useToast();
  const template = useTemplate(templateId, i18n.language);
  const shoppingList = useShoppingList(i18n.language);
  const apply = useApplyTemplate(i18n.language);
  // Only the lines the Member has flipped; every other line keeps its default.
  const [flipped, setFlipped] = useState<ReadonlySet<string>>(new Set());

  const back = (
    <BackButton
      label={t('templates:apply.allTemplates')}
      onClick={onBack}
      mb={1.5}
    />
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

  // Unchecked items already on the list.
  const unchecked = uncheckedItems(shoppingList.data);
  const lineOnList = (line: TemplateLine) =>
    unchecked.some((item) => isOnList(item, line));

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
        sx={{ minHeight: 48, borderRadius: radius.control }}
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
            ...displayType,
            fontSize: 22,
          }}
        >
          {name}
        </Typography>
        <Typography variant="meta" sx={{ color: tokens.color.muted }}>
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
            sx={{ mx: 0.5, mb: 1, color: tokens.color.muted }}
          >
            {group.title ?? t('templates:apply.unmatchedGroup')}
          </Typography>
          <Box
            sx={{
              borderRadius: radius.card,
              border: `1px solid ${tokens.color.line}`,
              backgroundColor: tokens.color.surface,
            }}
          >
            {group.lines.map((line) => {
              const tag = line.inPantry
                ? { text: t('templates:apply.inPantry'), ...okTag }
                : lineOnList(line)
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
                    '& + &': { borderTop: `1px solid ${tokens.color.divider}` },
                    ...insetFocusRing,
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
                      borderRadius: radius.box,
                      border: `2px solid ${on ? tokens.color.accent : color.box}`,
                      backgroundColor: on ? tokens.color.accent : 'transparent',
                      color: color.accentInk,
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
                          color: tokens.color.muted,
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
                        borderRadius: radius.pill,
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
      <SheetFooter>{footer}</SheetFooter>
    </Box>
  );
}

const okTag = { fg: tokens.color.okFg, bg: tokens.color.okBg };
const soonTag = { fg: tokens.color.soonFg, bg: tokens.color.soonBg };
