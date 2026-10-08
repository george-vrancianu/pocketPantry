import { Button, Dialog } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { CatalogSearch } from '../../../components/CatalogSearch';
import type { CatalogSearchResult } from '../../../lib/catalog';

type Props = {
  /** The name of the line being matched; null while the dialog is shut. */
  name: string | null;
  onSelect: (match: CatalogSearchResult) => void;
  /** Escape, backdrop click, or Cancel: the line stays as it was. */
  onClose: () => void;
};

/**
 * Pick the Ingredient a Review line matches: a bottom sheet on a phone, a
 * centred dialog on a wide screen. One instance serves every layout.
 */
export function MatchDialog({ name, onSelect, onClose }: Props) {
  const { t } = useTranslation('review');
  return (
    <Dialog
      open={name !== null}
      onClose={onClose}
      title={t('match.dialogTitle', { name: name ?? '' })}
      actions={
        <Button variant="text" onClick={onClose}>
          {t('match.cancel')}
        </Button>
      }
    >
      <CatalogSearch autoFocus onSelect={onSelect} />
    </Dialog>
  );
}
