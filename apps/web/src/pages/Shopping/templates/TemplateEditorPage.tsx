import {
  Alert,
  Box,
  Button,
  CloseIcon,
  IconButton,
  Link,
  ListRow,
  ListRowItem,
  Spinner,
  Stack,
  TextField,
  Typography,
} from '@pocket-pantry/ui';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { AppScreenHeader } from '../../../components/AppScreenHeader';
import { ConfirmAction } from '../../../components/ConfirmAction';
import { translateApiError } from '../../../i18n/translateApiError';
import type { NewShoppingItem } from '../../../lib/shopping';
import {
  MAX_TEMPLATE_LINES,
  toLineBody,
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

  const replaceLines = (next: NewShoppingItem[]) =>
    update.mutateAsync({ id: template.id, lines: next });

  const add = (item: NewShoppingItem) =>
    replaceLines([...lines.map(toLineBody), item]).then(
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
            <ListRowItem key={line.id}>
              <ListRow
                title={`${line.name}${
                  line.quantity !== null
                    ? `, ${line.quantity}${line.unit ? ` ${t(`common:units.${line.unit}`)}` : ''}`
                    : ''
                }`}
                trailing={
                  <IconButton
                    label={t('templates:editor.remove', { name: line.name })}
                    disabled={update.isPending}
                    onClick={() =>
                      void replaceLines(
                        lines.filter((l) => l.id !== line.id).map(toLineBody),
                      )
                    }
                  >
                    <CloseIcon size={18} />
                  </IconButton>
                }
              />
            </ListRowItem>
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
