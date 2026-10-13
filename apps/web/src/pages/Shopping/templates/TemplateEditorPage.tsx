import {
  Alert,
  Box,
  Button,
  Link,
  ListRow,
  SwipeRow,
  type SwipeRowHandle,
  Spinner,
  Stack,
  TextField,
  Typography,
  useToast,
} from '@pocket-pantry/ui';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { AppScreenHeader } from '../../../components/AppScreenHeader';
import { ConfirmAction } from '../../../components/ConfirmAction';
import { AmountSheet, type Amount } from '../../../components/AmountSheet';
import { translateApiError } from '../../../i18n/translateApiError';
import { UNDO_WINDOW_MS } from '../../../lib/useDeferredRemoval';
import { useSwipeRowLabels } from '../../../lib/useSwipeRowLabels';
import type { NewShoppingItem } from '../../../lib/shopping';
import {
  MAX_TEMPLATE_LINES,
  toLineBody,
  type TemplateLine,
  useTemplate,
  useTemplateMutations,
  type Template,
} from '../../../lib/shoppingTemplates';
import { AddItemForm } from '../components/AddItemForm';
import { ApplyTemplatePicker } from './ApplyTemplatePicker';

/** Rename a Template, add lines with Catalog search, remove lines, delete it, or apply it. */
export function TemplateEditorPage() {
  const { id = '' } = useParams();
  const { t, i18n } = useTranslation(['templates', 'common']);
  const template = useTemplate(id, i18n.language);
  const [applying, setApplying] = useState(false);

  if (applying) {
    return (
      <>
        <AppScreenHeader title={t('templates:title')} />
        <ApplyTemplatePicker
          templateId={id}
          onDone={() => setApplying(false)}
          onCancel={() => setApplying(false)}
        />
      </>
    );
  }

  return (
    <>
      <AppScreenHeader title={template.data?.name ?? t('templates:title')} />
      {template.isPending ? <Spinner label={t('common:loading')} /> : null}
      {template.error ? (
        <Alert>{translateApiError(t, template.error)}</Alert>
      ) : null}
      {template.data ? (
        <Editor
          key={template.data.id}
          template={template.data}
          onApply={() => setApplying(true)}
        />
      ) : null}
    </>
  );
}

function Editor({
  template,
  onApply,
}: {
  template: Template;
  onApply: () => void;
}) {
  const { t, i18n } = useTranslation(['templates', 'common']);
  const navigate = useNavigate();
  const { update, remove } = useTemplateMutations(i18n.language);
  const [name, setName] = useState(template.name);

  const lines = template.lines;
  const full = lines.length >= MAX_TEMPLATE_LINES;

  const rename = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed && trimmed !== template.name) {
      update.mutate({ id: template.id, name: trimmed });
    }
  };

  // The newest lines we know of: the page's, or the last save's reply. Undo builds on these, not on
  // what the page rendered when the toast appeared.
  const latest = useRef(lines);
  latest.current = lines;
  const saving = useRef<Promise<unknown>>(Promise.resolve());
  const save = (next: NewShoppingItem[]) => {
    const request = update.mutateAsync({ id: template.id, lines: next });
    saving.current = request.then(
      (saved) => {
        latest.current = saved.lines;
      },
      () => undefined,
    );
    return request;
  };

  // Removing a Template Line saves at once, without it (ADR 0009: the exception, because a line is only
  // a name, an amount and a unit). Undo saves the lines again with it back at its old position.
  const toast = useToast();
  const undone = useRef(false);
  const removeLine = async (line: TemplateLine) => {
    const index = lines.findIndex((l) => l.id === line.id);
    await save(lines.filter((l) => l.id !== line.id).map(toLineBody));
    undone.current = false;
    toast.show(t('common:row.removed', { name: line.name }), {
      duration: UNDO_WINDOW_MS,
      action: {
        label: t('common:row.undo'),
        onClick: () => {
          if (undone.current) return;
          undone.current = true;
          void restore(line, index);
        },
      },
    });
  };
  const restore = async (line: TemplateLine, index: number) => {
    // Let a save that is still in flight land first, then put the line back on top of it.
    await saving.current;
    const next = latest.current.map(toLineBody);
    next.splice(Math.min(index, next.length), 0, toLineBody(line));
    try {
      await save(next);
    } catch (error) {
      toast.show(translateApiError(t, error));
    }
  };

  const setAmount = (line: TemplateLine, amount: Amount) =>
    save(
      lines.map((l) => toLineBody(l.id === line.id ? { ...l, ...amount } : l)),
    );

  const add = (item: NewShoppingItem) =>
    save([...lines.map(toLineBody), item]).then(
      () => true,
      () => false,
    );

  const error = update.error ?? remove.error;

  return (
    <Stack spacing={2.5}>
      {error ? <Alert>{translateApiError(t, error)}</Alert> : null}
      <Box component="form" onSubmit={rename} noValidate>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
          <TextField
            label={t('templates:editor.name')}
            value={name}
            onChange={(event) => setName(event.target.value)}
            slotProps={{ htmlInput: { maxLength: 100 } }}
          />
          <Button
            type="submit"
            variant="secondary"
            disabled={!name.trim() || name.trim() === template.name}
            sx={{ minHeight: 56 }}
          >
            {t('templates:editor.rename')}
          </Button>
        </Stack>
      </Box>

      {lines.length === 0 ? (
        <Typography color="text.secondary">
          {t('templates:editor.empty')}
        </Typography>
      ) : (
        <Stack component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
          {lines.map((line) => (
            <LineRow
              key={line.id}
              line={line}
              busy={update.isPending}
              onRemove={removeLine}
              onSetAmount={setAmount}
            />
          ))}
        </Stack>
      )}

      {full ? null : <AddItemForm adding={update.isPending} onAdd={add} />}

      <Button onClick={onApply} disabled={lines.length === 0}>
        {t('templates:editor.apply')}
      </Button>
      <ConfirmAction
        label={t('templates:editor.delete')}
        message={t('templates:editor.deleteConfirm')}
        disabled={remove.isPending}
        onConfirm={() =>
          remove.mutate(template.id, {
            onSuccess: () => navigate('/shopping/templates'),
          })
        }
      />
      <Link href="/shopping/templates">{t('templates:editor.back')}</Link>
    </Stack>
  );
}

function LineRow({
  line,
  busy,
  onRemove,
  onSetAmount,
}: {
  line: TemplateLine;
  /** A Template save is in flight: rows ignore gestures and keys until it lands. */
  busy: boolean;
  onRemove: (line: TemplateLine) => Promise<unknown>;
  onSetAmount: (line: TemplateLine, amount: Amount) => Promise<unknown>;
}) {
  const { t } = useTranslation('common');
  const toast = useToast();
  const labels = useSwipeRowLabels(line.name, 'template', { hold: true });
  const [editing, setEditing] = useState(false);
  const row = useRef<SwipeRowHandle>(null);
  // Bumped when a removal fails: a swiped-off row stays flown off and inert, so it is mounted afresh.
  const [attempt, setAttempt] = useState(0);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // "Remove line" closes the sheet first and asks once it is gone, so that the confirmation's Keep
  // button is focused after the sheet has handed focus back to the row.
  const [askAfterClose, setAskAfterClose] = useState(false);
  useEffect(() => {
    if (!askAfterClose || editing) return;
    setAskAfterClose(false);
    row.current?.askToRemove();
  }, [askAfterClose, editing]);

  const meta =
    line.quantity === null
      ? null
      : line.unit
        ? `${line.quantity} ${t(`units.${line.unit}`)}`
        : String(line.quantity);

  return (
    <>
      <SwipeRow
        key={attempt}
        ref={row}
        name={line.name}
        labels={labels}
        disabled={editing || busy}
        onEdit={() => setEditing(true)}
        onRemove={() => {
          // The page shows the failure; the row only has to be usable again.
          onRemove(line).catch(() => {
            if (mounted.current) setAttempt((n) => n + 1);
          });
        }}
      >
        <ListRow title={line.name} meta={meta} />
      </SwipeRow>
      <AmountSheet
        open={editing}
        name={line.name}
        context={t('row.context.template')}
        amount={{ quantity: line.quantity, unit: line.unit }}
        onSave={async (amount) => {
          await onSetAmount(line, amount);
          setEditing(false);
          toast.show(t('row.updated', { name: line.name }));
        }}
        onClose={() => setEditing(false)}
        removeLabel={t('edit.removeLine')}
        onRemove={() => {
          setEditing(false);
          setAskAfterClose(true);
        }}
      />
    </>
  );
}
