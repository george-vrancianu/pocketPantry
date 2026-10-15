import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { defaultExpiryDate, type Batch, type IsoDate } from '../../lib/pantry';
import { useToday } from '../../lib/useToday';
import { ExpirySheet } from '../ExpiryPicker';
import { expiryContext } from '../ExpiryPicker/expiryContext';

type Props = {
  /** The undated Batch to date; null while closed. */
  batch: Batch | null;
  onClose: () => void;
  /** With the chosen date when the sheet closes on one. */
  onSave: (batch: Batch, expiryDate: IsoDate) => void;
};

/** The usual expiry sheet for one undated Batch, opening on its Default Expiry; closing on a date saves it. */
export function SetDateSheet({ batch, onClose, onSave }: Props) {
  const { t, i18n } = useTranslation('pantry');
  const today = useToday();
  const [chosen, setChosen] = useState<IsoDate | null>(null);
  // Kept through the close transition, so the sheet does not empty out as it leaves.
  const [shown, setShown] = useState<Batch | null>(null);
  if (batch !== null && shown === null) {
    setShown(batch);
    setChosen(
      batch.defaultExpiryDays === null
        ? null
        : defaultExpiryDate(batch.defaultExpiryDays, today),
    );
  }

  return (
    <ExpirySheet
      open={batch !== null}
      onClose={() => {
        if (batch !== null && chosen !== null) onSave(batch, chosen);
        onClose();
      }}
      onExited={() => setShown(null)}
      value={chosen}
      onChange={setChosen}
      usualDays={shown?.defaultExpiryDays ?? null}
      context={
        shown === null
          ? ''
          : expiryContext(
              {
                name: shown.name,
                quantity: shown.quantity === null ? '' : String(shown.quantity),
                unit: shown.unit,
                location: shown.location,
              },
              i18n.language,
              t,
            )
      }
      title={t('picker.label')}
    />
  );
}
