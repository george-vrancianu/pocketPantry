import { Alert, Button, Stack, Typography } from '@pocket-pantry/ui';
import { useEffect, useRef, type FormEvent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmAction } from '../../../components/ConfirmAction';
import { translateApiError } from '../../../i18n/translateApiError';

type Props = {
  heading: string;
  /** The last API error of any write in the form, if any. */
  error: unknown;
  canSave: boolean;
  saving: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  /** Omit when creating: there is nothing to delete yet. */
  onDelete?: () => void;
  deleting?: boolean;
  children: ReactNode;
};

/**
 * Shared frame of the Admin editors: a heading that takes focus when the
 * editor opens, the error, the fields, and Save / Cancel / two-step Delete.
 */
export function EditorForm({
  heading,
  error,
  canSave,
  saving,
  onSubmit,
  onCancel,
  onDelete,
  deleting,
  children,
}: Props) {
  const { t } = useTranslation(['admin', 'errors']);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Stack component="form" spacing={2} onSubmit={submit} noValidate>
      <Typography
        ref={headingRef}
        component="h2"
        variant="h6"
        tabIndex={-1}
        sx={{ outline: 'none' }}
      >
        {heading}
      </Typography>
      {error ? <Alert>{translateApiError(t, error)}</Alert> : null}
      {children}
      <Stack direction="row" spacing={1}>
        <Button type="submit" disabled={saving || !canSave}>
          {saving ? t('admin:common.saving') : t('admin:common.save')}
        </Button>
        <Button variant="text" onClick={onCancel}>
          {t('admin:common.cancel')}
        </Button>
      </Stack>
      {onDelete ? (
        <ConfirmAction
          variant="text"
          label={t('admin:common.delete')}
          message={t('admin:common.deleteConfirm')}
          disabled={deleting}
          onConfirm={onDelete}
        />
      ) : null}
    </Stack>
  );
}
