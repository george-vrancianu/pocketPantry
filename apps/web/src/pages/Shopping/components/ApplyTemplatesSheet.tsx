import {
  Alert,
  Box,
  Button,
  Card,
  CheckIcon,
  ImportIcon,
  color as themeColor,
  Link,
  MinusIcon,
  Sheet,
  Spinner,
  TemplateIcon,
  Typography,
  displayType,
  insetFocusRing,
  radius,
  tokens,
  useToast,
} from '@pocket-pantry/ui';
import { useQueries } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import { useShoppingList } from '../../../lib/shopping';
import {
  templateQueryOptions,
  useApplyTemplate,
  useTemplates,
  type Template,
  type TemplateSummary,
} from '../../../lib/shoppingTemplates';
import {
  bulkBody,
  emptySelection,
  includeTemplate,
  removeTemplate,
  summarize,
  templateState,
  type Selection,
  type TemplateState,
} from '../../../lib/templateSelection';

export type ApplyTemplatesSheetProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * The Import sheet: applies several Shopping Templates to the Shopping List in
 * one go ("Import" is only the UI label). Closing resets it; the body remounts
 * on each opening so nothing is included and every row is collapsed.
 */
export function ApplyTemplatesSheet({
  open,
  onClose,
}: ApplyTemplatesSheetProps) {
  const [form, setForm] = useState(0);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setForm((n) => n + 1);
  }
  return <ApplyForm key={form} open={open} onClose={onClose} />;
}

function ApplyForm({ open, onClose }: ApplyTemplatesSheetProps) {
  const { t, i18n } = useTranslation(['shopping', 'templates', 'common']);
  const toast = useToast();
  const templates = useTemplates(i18n.language);
  const shoppingList = useShoppingList(i18n.language);
  const apply = useApplyTemplate(i18n.language);
  const [selection, setSelection] = useState<Selection>(emptySelection);
  // Templates ticked while their lines are still loading.
  const [pending, setPending] = useState<ReadonlySet<string>>(new Set());

  const summaries = templates.data ?? [];
  // Details are fetched only for Templates the Member has ticked.
  const detailQueries = useQueries({
    queries: summaries.map((summary) => ({
      ...templateQueryOptions(summary.id, i18n.language),
      enabled: pending.has(summary.id) || selection.has(summary.id),
    })),
  });
  const details = new Map<string, Template>();
  summaries.forEach((summary, index) => {
    const data = detailQueries[index]?.data;
    if (data) details.set(summary.id, data);
  });
  const detailsError = detailQueries.find((query) => query.error)?.error;
  const listSettled = !shoppingList.isPending;

  // A ticked Template joins the selection once its lines (and the list the
  // default selection depends on) are here. One whose lines failed to load is
  // dropped; the error shows above.
  useEffect(() => {
    if (pending.size === 0 || !listSettled) return;
    const settled = summaries
      .map((summary, index) => ({
        id: summary.id,
        query: detailQueries[index],
      }))
      .filter(
        ({ id, query }) => pending.has(id) && (query?.data || query?.error),
      );
    if (settled.length === 0) return;
    setSelection((current) =>
      settled.reduce((next, { query }) => {
        return query?.data
          ? includeTemplate(next, query.data, shoppingList.data)
          : next;
      }, current),
    );
    setPending((current) => {
      const next = new Set(current);
      settled.forEach(({ id }) => next.delete(id));
      return next;
    });
  });

  const tick = (summary: TemplateSummary) => {
    if (selection.has(summary.id)) {
      setSelection(removeTemplate(selection, summary.id));
      return;
    }
    setPending((current) => {
      const next = new Set(current);
      if (!next.delete(summary.id)) next.add(summary.id);
      return next;
    });
  };

  const included = summaries.filter((s) => selection.has(s.id));
  const loaded = included.flatMap((s) => details.get(s.id) ?? []);
  const summary = summarize(selection, loaded);
  const pickedNames = summary.templates.map((template) => template.name);

  const submit = () =>
    apply.mutate(bulkBody(selection, loaded), {
      onSuccess: () => {
        onClose();
        toast.show(
          pickedNames.length === 1
            ? t('shopping:import.done', {
                count: summary.items,
                name: pickedNames[0],
              })
            : t('shopping:import.doneMany', {
                count: summary.items,
                templates: pickedNames.length,
              }),
          { duration: 3000, polite: true },
        );
      },
    });

  const canApply = summary.items > 0 && !summary.overCap && !apply.isPending;

  const header = (
    <Box
      sx={{
        p: '10px 16px 10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5,
      }}
    >
      <Typography component="h2" sx={{ ...displayType, fontSize: 22 }}>
        {t('shopping:import.title')}
      </Typography>
      <Box
        component="button"
        type="button"
        onClick={onClose}
        sx={{
          height: 36,
          px: 2,
          border: 0,
          borderRadius: radius.pill,
          cursor: 'pointer',
          backgroundColor: tokens.color.ink,
          color: tokens.color.bg,
          font: 'inherit',
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        {t('shopping:import.close')}
      </Box>
    </Box>
  );

  const footer = (
    <Box
      sx={{
        p: '12px 20px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        borderTop: `1px solid ${tokens.color.line}`,
      }}
    >
      {included.length > 0 ? (
        <Typography
          variant="meta"
          sx={{
            textAlign: 'center',
            color: tokens.color.muted,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {summary.overCap
            ? t('shopping:import.tooMany')
            : [
                t('shopping:import.from', {
                  names: included.map((s) => s.name).join(', '),
                }),
                ...(summary.repeats > 0
                  ? [t('shopping:import.repeats', { count: summary.repeats })]
                  : []),
              ].join(' · ')}
        </Typography>
      ) : null}
      <Button
        fullWidth
        startIcon={<ImportIcon size={18} />}
        disabled={!canApply}
        onClick={submit}
        sx={{ minHeight: 48, borderRadius: radius.control }}
      >
        {apply.isPending
          ? t('shopping:import.pending')
          : summary.items === 0
            ? t('shopping:import.pickOne')
            : t('shopping:import.confirm', { count: summary.items })}
      </Button>
    </Box>
  );

  return (
    <Sheet
      open={open}
      onClose={onClose}
      label={t('shopping:import.title')}
      header={header}
      footer={footer}
    >
      <Box
        sx={{
          p: '4px 20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2.25,
        }}
      >
        {apply.error ? (
          <Alert>{translateApiError(t, apply.error)}</Alert>
        ) : null}
        {detailsError ? (
          <Alert>{translateApiError(t, detailsError)}</Alert>
        ) : null}
        <Typography variant="meta" sx={{ color: tokens.color.muted }}>
          {t('shopping:import.hint')}
        </Typography>
        <Box component="section">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              mb: 1,
            }}
          >
            <Typography
              component="h3"
              variant="sectionLabel"
              sx={{ color: tokens.color.muted }}
            >
              {t('shopping:import.section', { count: summaries.length })}
            </Typography>
            <Link href="/shopping/templates">
              {t('shopping:import.manage')}
            </Link>
          </Box>
          {templates.isPending ? <Spinner label={t('common:loading')} /> : null}
          {templates.error ? (
            <Alert>{translateApiError(t, templates.error)}</Alert>
          ) : null}
          {templates.data && summaries.length === 0 ? (
            <Typography color="text.secondary">
              {t('shopping:import.none')}
            </Typography>
          ) : null}
          {summaries.length > 0 ? (
            <Card variant="list" sx={{ p: 0 }}>
              {summaries.map((row) => {
                const detail = details.get(row.id);
                return (
                  <TemplateRow
                    key={row.id}
                    summary={row}
                    state={
                      detail ? templateState(selection, detail) : 'excluded'
                    }
                    loading={pending.has(row.id)}
                    ticked={selection.get(row.id)?.size ?? 0}
                    total={detail?.lines.length ?? row.lineCount}
                    onTick={() => tick(row)}
                  />
                );
              })}
            </Card>
          ) : null}
        </Box>
      </Box>
    </Sheet>
  );
}

type TemplateRowProps = {
  summary: TemplateSummary;
  state: TemplateState;
  /** The Template's lines are still loading after a tick. */
  loading: boolean;
  ticked: number;
  total: number;
  onTick: () => void;
};

/**
 * One collapsed Template row: the tick on the left, the Template's name and
 * summary line next to it. Opening a row to pick lines nests them under it.
 */
function TemplateRow({
  summary,
  state,
  loading,
  ticked,
  total,
  onTick,
}: TemplateRowProps) {
  const { t } = useTranslation(['shopping', 'templates']);
  const { color } = tokens;
  const included = state !== 'excluded';
  const partial = state === 'all' || state === 'mixed';
  return (
    <Box sx={{ '& + &': { borderTop: `1px solid ${color.divider}` } }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box
          component="button"
          type="button"
          role="checkbox"
          aria-checked={
            state === 'all' ? true : state === 'mixed' ? 'mixed' : false
          }
          aria-label={t('shopping:import.tickLabel', { name: summary.name })}
          onClick={onTick}
          sx={{
            p: '12px 4px 12px 14px',
            border: 0,
            backgroundColor: 'transparent',
            color: 'inherit',
            cursor: 'pointer',
            ...insetFocusRing,
          }}
        >
          <Box
            aria-hidden
            sx={{
              width: 24,
              height: 24,
              display: 'grid',
              placeItems: 'center',
              borderRadius: radius.box,
              border: `2px solid ${partial ? color.accent : color.tickBorder}`,
              backgroundColor:
                state === 'all'
                  ? color.accent
                  : state === 'mixed'
                    ? color.accentTint
                    : 'transparent',
              color: state === 'all' ? themeColor.accentInk : color.accent,
              '& .MuiCircularProgress-root': {
                width: '14px !important',
                height: '14px !important',
              },
            }}
          >
            {loading ? (
              <Spinner label="" />
            ) : state === 'all' ? (
              <CheckIcon size={14} />
            ) : state === 'mixed' ? (
              <MinusIcon size={14} />
            ) : null}
          </Box>
        </Box>
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            p: '10px 14px 10px 6px',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Box
            aria-hidden
            sx={{
              flexShrink: 0,
              width: 36,
              height: 36,
              display: 'grid',
              placeItems: 'center',
              borderRadius: radius.control,
              backgroundColor: color.butter,
              color: color.butterInk,
            }}
          >
            <TemplateIcon size={20} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                fontSize: 15,
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {summary.name}
            </Box>
            <Box
              sx={{
                fontSize: 12.5,
                color: color.muted,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {included
                ? t('shopping:import.selected', { ticked, total })
                : [
                    t('templates:list.items', { count: summary.lineCount }),
                    ...(summary.previewNames.length > 0
                      ? [summary.previewNames.slice(0, 3).join(', ')]
                      : []),
                  ].join(' · ')}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
