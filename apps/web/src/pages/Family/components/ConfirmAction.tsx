import { Alert, Button, Stack } from '@pocket-pantry/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  label: string;
  message: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'text';
  onConfirm: () => void;
};

/** A destructive action behind an inline "are you sure" step. */
export function ConfirmAction({
  label,
  message,
  disabled,
  variant = 'secondary',
  onConfirm,
}: Props) {
  const { t } = useTranslation('family');
  const [asking, setAsking] = useState(false);

  if (!asking) {
    return (
      <Button
        variant={variant}
        disabled={disabled}
        onClick={() => setAsking(true)}
      >
        {label}
      </Button>
    );
  }
  return (
    <Stack spacing={1}>
      <Alert severity="info">{message}</Alert>
      <Stack direction="row" spacing={1}>
        <Button
          disabled={disabled}
          onClick={() => {
            setAsking(false);
            onConfirm();
          }}
        >
          {t('confirm')}
        </Button>
        <Button variant="text" onClick={() => setAsking(false)}>
          {t('cancel')}
        </Button>
      </Stack>
    </Stack>
  );
}
