import {
  ActionMenu,
  Alert,
  BranchIcon,
  DeleteIcon,
  ManualEntryIcon,
  PlusIcon,
  Stack,
} from '@pocket-pantry/ui';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AppScreenHeader } from '../../../components/AppScreenHeader';
import { ConfirmPrompt } from '../../../components/ConfirmAction';
import { translateApiError } from '../../../i18n/translateApiError';
import { useArchiveFamilyRecipe } from '../../../lib/familyRecipes';
import type { RecipeDetail } from '../../../lib/recipes';

/**
 * The Recipe screen's header: Back to the list, and what a Member can do with
 * the Recipe. A Catalog Recipe offers Make a Variant; the Family's own live
 * Recipe keeps Make a Variant, Edit and Delete (archive) in a menu.
 */
export function RecipeHeader({ recipe }: { recipe: RecipeDetail | undefined }) {
  const { t } = useTranslation(['recipes', 'errors']);
  const navigate = useNavigate();
  const archive = useArchiveFamilyRecipe(recipe?.id ?? '');
  const [asking, setAsking] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const back = { label: t('recipes:back'), href: '/recipes' };
  // No Recipe yet (loading, not found): keep a title so the screen has an H1.
  if (!recipe)
    return <AppScreenHeader back={back} title={t('recipes:title')} />;

  const own = recipe.owner === 'family' && !recipe.archived;
  // A Variant's parent is a Catalog Base Recipe, so a Family Base Recipe
  // gets none; the Recipe and its base must also be live.
  const canMakeVariant =
    !recipe.archived &&
    !recipe.base?.archived &&
    !(recipe.owner === 'family' && recipe.parentId === null);
  const makeVariant = {
    label: t('recipes:family.makeVariant'),
    href: `/recipes/${recipe.id}/variant/new`,
  };

  const remove = () =>
    archive.mutate(undefined, {
      onSuccess: () =>
        navigate(recipe.base ? `/recipes/${recipe.base.id}` : '/recipes'),
    });

  return (
    <>
      <AppScreenHeader
        back={back}
        action={
          !own && canMakeVariant
            ? { ...makeVariant, icon: <PlusIcon size={20} /> }
            : undefined
        }
        trailing={
          own ? (
            <ActionMenu
              buttonRef={menuButton}
              label={t('recipes:family.moreActions')}
              items={[
                ...(canMakeVariant
                  ? [{ ...makeVariant, icon: <BranchIcon /> }]
                  : []),
                {
                  label: t('recipes:family.edit'),
                  href: `/recipes/${recipe.id}/edit`,
                  icon: <ManualEntryIcon />,
                },
                {
                  label: t('recipes:family.delete'),
                  icon: <DeleteIcon />,
                  tone: 'urgent' as const,
                  onClick: () => setAsking(true),
                },
              ]}
            />
          ) : undefined
        }
      />
      {archive.error || asking ? (
        <Stack spacing={1} sx={{ mb: 2 }}>
          {archive.error ? (
            <Alert>{translateApiError(t, archive.error)}</Alert>
          ) : null}
          {asking ? (
            <ConfirmPrompt
              message={t('recipes:family.deleteConfirm')}
              disabled={archive.isPending}
              onConfirm={() => {
                setAsking(false);
                remove();
              }}
              onCancel={() => {
                setAsking(false);
                menuButton.current?.focus();
              }}
            />
          ) : null}
        </Stack>
      ) : null}
    </>
  );
}
