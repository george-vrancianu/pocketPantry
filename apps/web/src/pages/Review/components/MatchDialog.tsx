import { Button, Dialog } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { CatalogSearch } from '../../../components/CatalogSearch';
import type { CatalogSearchResult } from '../../../lib/catalog';

type Props = {
  open: boolean;
  /** The name of the line being matched. */
  name: string;
  onSelect: (match: CatalogSearchResult) => void;
  /** Escape, backdrop click, or Cancel: the line stays as it was. */
  onClose: () => void;
};

/**
 * Pick the Ingredient a Review line matches: a bottom sheet on a phone, a
 * centred dialog on a wide screen. One instance serves every layout.
 */
export function MatchDialog({ open, name, onSelect, onClose }: Props) {
  const { t } = useTranslation(['review', 'common']);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t('review:match.dialogTitle', { name })}
      actions={
        <Button variant="text" onClick={onClose}>
          {t('common:cancel')}
        </Button>
      }
    >
      <CatalogSearch autoFocus onSelect={onSelect} />
    </Dialog>
  );
}
