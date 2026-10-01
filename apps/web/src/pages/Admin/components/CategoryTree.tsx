import { Button, Stack, Typography } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import {
  localName,
  type AdminCatalog,
  type CategoryKind,
} from '../../../lib/admin';

type Props = {
  catalog: AdminCatalog;
  onCreate: (kind: CategoryKind) => void;
  onEdit: (kind: CategoryKind, id: string) => void;
};

/** Parent Categories with their Leaf Categories underneath. */
export function CategoryTree({ catalog, onCreate, onEdit }: Props) {
  const { t, i18n } = useTranslation('admin');
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1}>
        <Button onClick={() => onCreate('parent')}>
          {t('category.newParent')}
        </Button>
        <Button variant="secondary" onClick={() => onCreate('leaf')}>
          {t('category.newLeaf')}
        </Button>
      </Stack>
      {catalog.parentCategories.map((parent) => {
        const leaves = catalog.leafCategories.filter(
          (leaf) => leaf.parentId === parent.id,
        );
        const parentName = localName(parent, i18n.language);
        return (
          <Stack key={parent.id} component="section" spacing={0.5}>
            <Button
              variant="text"
              aria-label={t('category.editParent', { name: parentName })}
              onClick={() => onEdit('parent', parent.id)}
            >
              {parentName}
            </Button>
            <Typography variant="body2" color="text.secondary">
              {t('category.leafCount', { count: leaves.length })}
            </Typography>
            <Stack component="ul" sx={{ m: 0, pl: 2, listStyle: 'none' }}>
              {leaves.map((leaf) => {
                const leafName = localName(leaf, i18n.language);
                return (
                  <li key={leaf.id}>
                    <Button
                      variant="text"
                      aria-label={t('category.editLeaf', { name: leafName })}
                      onClick={() => onEdit('leaf', leaf.id)}
                    >
                      {leafName}
                    </Button>
                  </li>
                );
              })}
            </Stack>
          </Stack>
        );
      })}
    </Stack>
  );
}
