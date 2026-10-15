import { Box, Typography } from '@pocket-pantry/ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EditorForm } from '../../../components/EditorForm';
import {
  usePromoteFamilyIngredient,
  type FamilyIngredientGroup,
  type PromoteResult,
} from '../../../lib/familyIngredientsQueue';

type Props = {
  group: FamilyIngredientGroup;
  onDone: (result: PromoteResult) => void;
  onCancel: () => void;
};

/**
 * Promote one Family Ingredient: the Admin picks which Family's copy becomes
 * the shared Ingredient (the oldest by default); the others are merged into it.
 */
export function FamilyIngredientPromote({ group, onDone, onCancel }: Props) {
  const { t } = useTranslation('admin');
  const promote = usePromoteFamilyIngredient();
  const groupName = useId();
  const [chosen, setChosen] = useState(group.copies[0]?.id ?? '');

  const submit = () => {
    if (!chosen || promote.isPending) return;
    promote.mutate(chosen, { onSuccess: onDone });
  };

  return (
    <EditorForm
      heading={t('familyIngredients.promoteName', { name: group.name })}
      description={
        group.copies.length > 1 ? t('familyIngredients.promoteHint') : undefined
      }
      error={promote.error}
      canSave={chosen !== ''}
      saving={promote.isPending}
      onSubmit={submit}
      onCancel={onCancel}
      saveLabel={t('familyIngredients.promote')}
      savingLabel={t('familyIngredients.promoting')}
    >
      <Box
        component="fieldset"
        sx={{ border: 0, m: 0, p: 0, display: 'grid', gap: 0.5 }}
      >
        <Typography component="legend" variant="body2" sx={{ pb: 1 }}>
          {t('familyIngredients.pickCopy')}
        </Typography>
        {group.copies.map((copy) => (
          <Box
            key={copy.id}
            component="label"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              minHeight: 44,
            }}
          >
            <input
              type="radio"
              name={groupName}
              checked={chosen === copy.id}
              onChange={() => setChosen(copy.id)}
              style={{ width: 20, height: 20 }}
            />
            {t('familyIngredients.copy', {
              name: copy.name,
              leaf: copy.leafCategory.name,
              locale: t(`locales.${copy.locale}`),
            })}
          </Box>
        ))}
      </Box>
    </EditorForm>
  );
}
