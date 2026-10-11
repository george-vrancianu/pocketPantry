import {
  Alert,
  Box,
  Button,
  Link,
  Stack,
  TextField,
  Typography,
} from '@pocket-pantry/ui';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { translateApiError } from '../../../i18n/translateApiError';
import {
  useTemplateMutations,
  useTemplates,
} from '../../../lib/shoppingTemplates';
import { ApplyTemplatePicker } from './ApplyTemplatePicker';

type Mode = 'idle' | 'saving' | 'choosing' | { applying: string };

/**
 * Template actions on the Shopping List: apply one through the picker, save the
 * current list as a new one, or open the Templates screen.
 */
export function TemplateActions() {
  const { t, i18n } = useTranslation('templates');
  const navigate = useNavigate();
  const templates = useTemplates();
  const { createFromList } = useTemplateMutations(i18n.language);
  const [mode, setMode] = useState<Mode>('idle');
  const [name, setName] = useState('');

  const close = () => setMode('idle');

  if (typeof mode === 'object') {
    return (
      <ApplyTemplatePicker
        templateId={mode.applying}
        onDone={close}
        onCancel={close}
      />
    );
  }

  const save = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    createFromList.mutate(trimmed, {
      onSuccess: (created) => navigate(`/shopping/templates/${created.id}`),
    });
  };

  if (mode === 'saving') {
    return (
      <Box component="form" onSubmit={save} noValidate>
        <Stack spacing={1.5}>
          {createFromList.error ? (
            <Alert>{translateApiError(t, createFromList.error)}</Alert>
          ) : null}
          <TextField
            label={t('save.name')}
            value={name}
            onChange={(event) => setName(event.target.value)}
            slotProps={{ htmlInput: { maxLength: 100 } }}
            autoFocus
          />
          <Stack direction="row" spacing={1}>
            <Button
              type="submit"
              disabled={!name.trim() || createFromList.isPending}
            >
              {createFromList.isPending ? t('save.saving') : t('save.submit')}
            </Button>
            <Button variant="text" onClick={close}>
              {t('apply.cancel')}
            </Button>
          </Stack>
        </Stack>
      </Box>
    );
  }

  if (mode === 'choosing') {
    const items = templates.data ?? [];
    return (
      <Stack spacing={1} role="region" aria-label={t('apply.choose')}>
        <Typography variant="h2">{t('apply.choose')}</Typography>
        {templates.error ? (
          <Alert>{translateApiError(t, templates.error)}</Alert>
        ) : null}
        {templates.data && items.length === 0 ? (
          <Typography color="text.secondary">{t('apply.none')}</Typography>
        ) : null}
        {items.map((template) => (
          <Button
            key={template.id}
            variant="secondary"
            onClick={() => setMode({ applying: template.id })}
          >
            {template.name}
          </Button>
        ))}
        <Button variant="text" onClick={close}>
          {t('apply.cancel')}
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1}>
        <Button variant="secondary" onClick={() => setMode('choosing')}>
          {t('apply.button')}
        </Button>
        <Button variant="secondary" onClick={() => setMode('saving')}>
          {t('save.button')}
        </Button>
      </Stack>
      <Link href="/shopping/templates">{t('open')}</Link>
    </Stack>
  );
}
