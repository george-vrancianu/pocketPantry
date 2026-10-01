import { Alert, Button, Stack } from '@pocket-pantry/ui';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  label: string;
  /** Accessible name of the trigger, when `label` alone is ambiguous (e.g. per-row buttons). */
  triggerName?: string;
  message: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'text';
  onConfirm: () => void;
};

/**
 * A destructive action behind an inline "are you sure" step. Focus moves to
 * Confirm when the prompt opens and returns to the trigger on Cancel.
 */
export function ConfirmAction({
  label,
  triggerName,
  message,
  disabled,
  variant = 'secondary',
  onConfirm,
}: Props) {
  const { t } = useTranslation('family');
  const [asking, setAsking] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);

  useEffect(() => {
    if (asking) {
      confirmRef.current?.focus();
    } else if (restoreFocus.current) {
      restoreFocus.current = false;
      triggerRef.current?.focus();
    }
  }, [asking]);

  if (!asking) {
    return (
      <Button
        ref={triggerRef}
        variant={variant}
        disabled={disabled}
        aria-label={triggerName}
        onClick={() => setAsking(true)}
      >
        {label}
      </Button>
    );
  }
  return (
    <Stack spacing={1}>
      <Alert severity="warning">{message}</Alert>
      <Stack direction="row" spacing={1}>
        <Button
          ref={confirmRef}
          disabled={disabled}
          onClick={() => {
            setAsking(false);
            onConfirm();
          }}
        >
          {t('confirm')}
        </Button>
        <Button
          variant="text"
          onClick={() => {
            restoreFocus.current = true;
            setAsking(false);
          }}
        >
          {t('cancel')}
        </Button>
      </Stack>
    </Stack>
  );
}
