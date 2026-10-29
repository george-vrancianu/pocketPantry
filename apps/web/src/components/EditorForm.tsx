import { Alert, Button, Stack, Typography } from '@pocket-pantry/ui';
import { useEffect, useRef, type FormEvent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmAction } from './ConfirmAction';
import { translateApiError } from '../i18n/translateApiError';

type Props = {
  heading: string;
  /** A line under the heading. */
  description?: string;
  /** The last API error of any write in the form, if any. */
  error: unknown;
  /** The words for `error` when the caller words it itself (say, with params to format). */
  errorText?: string;
  canSave: boolean;
  saving: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  /** Omit when creating: there is nothing to delete yet. */
  onDelete?: () => void;
  deleting?: boolean;
  /** Own delete step, rendered where Delete goes, when the plain two-step `onDelete` does not fit. */
  deleteSlot?: ReactNode;
  /** Replace Save / Saving… on the submit button. */
  saveLabel?: string;
  savingLabel?: string;
  children: ReactNode;
};

/**
 * Shared frame of the editors (Admin and Recipes): a heading that takes focus when the
 * editor opens, the error, the fields, and Save / Cancel / two-step Delete.
 */
export function EditorForm({
  heading,
  description,
  error,
  errorText,
  canSave,
  saving,
  onSubmit,
  onCancel,
  onDelete,
  deleting,
  deleteSlot,
  saveLabel,
  savingLabel,
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
      {description ? (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      ) : null}
      {error ? <Alert>{errorText ?? translateApiError(t, error)}</Alert> : null}
      {children}
      <Stack direction="row" spacing={1}>
        <Button type="submit" disabled={saving || !canSave}>
          {saving
            ? (savingLabel ?? t('admin:common.saving'))
            : (saveLabel ?? t('admin:common.save'))}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          {t('admin:common.cancel')}
        </Button>
      </Stack>
      {onDelete ? (
        <ConfirmAction
          variant="ghost"
          label={t('admin:common.delete')}
          message={t('admin:common.deleteConfirm')}
          disabled={deleting}
          onConfirm={onDelete}
        />
      ) : (
        (deleteSlot ?? null)
      )}
    </Stack>
  );
}
