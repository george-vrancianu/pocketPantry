import { TextField } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import {
  localName,
  type AdminCatalog,
  type IngredientInput,
} from '../../../lib/admin';
import { UNITS, type Unit } from '../../../lib/catalog';

type Props = {
  catalog: AdminCatalog;
  value: IngredientInput;
  onChange: (value: IngredientInput) => void;
};

/** An Ingredient's name, Leaf Category and default unit, as the Admin editors edit them. */
export function IngredientFields({ catalog, value, onChange }: Props) {
  const { t, i18n } = useTranslation('admin');
  const leaves = catalog.leafCategories.map((leaf) => {
    const parent = catalog.parentCategories.find((p) => p.id === leaf.parentId);
    return {
      id: leaf.id,
      label: `${parent ? localName(parent, i18n.language) : ''} › ${localName(leaf, i18n.language)}`,
    };
  });

  return (
    <>
      <TextField
        label={t('admin:ingredient.name')}
        value={value.name}
        onChange={(event) => onChange({ ...value, name: event.target.value })}
        required
      />
      <TextField
        select
        label={t('admin:ingredient.leafCategory')}
        value={value.leafCategoryId}
        onChange={(event) =>
          onChange({ ...value, leafCategoryId: event.target.value })
        }
        slotProps={{ select: { native: true } }}
      >
        {leaves.map((leaf) => (
          <option key={leaf.id} value={leaf.id}>
            {leaf.label}
          </option>
        ))}
      </TextField>
      <TextField
        select
        label={t('admin:ingredient.defaultUnit')}
        value={value.defaultUnit}
        onChange={(event) =>
          onChange({ ...value, defaultUnit: event.target.value as Unit })
        }
        slotProps={{ select: { native: true } }}
      >
        {UNITS.map((unit) => (
          <option key={unit} value={unit}>
            {t(`common:units.${unit}`)}
          </option>
        ))}
      </TextField>
    </>
  );
}
