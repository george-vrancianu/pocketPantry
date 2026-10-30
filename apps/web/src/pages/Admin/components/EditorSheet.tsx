import { Box, Sheet } from '@pocket-pantry/ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { localName } from '../../../lib/admin';
import type { useAdminScreen } from '../hooks/useAdminScreen';

/**
 * A Catalog editor as a sheet over its list. Closing it (scrim, Escape or the editor's Cancel)
 * leaves the list as it was, with focus back on the row or button that opened it. The editor's
 * Save / Cancel row stays pinned to the bottom of the sheet while its form scrolls.
 */
export function EditorSheet({
  label,
  onClose,
  children,
}: {
  label: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Sheet open label={label} onClose={onClose}>
      <Box
        sx={{
          px: 3,
          pt: 3,
          pb: 0,
          '& [data-editor-actions]': {
            position: 'sticky',
            bottom: 0,
            zIndex: 1,
            py: 2,
            backgroundColor: 'background.default',
          },
        }}
      >
        {children}
      </Box>
    </Sheet>
  );
}

/** The sheet's accessible name: what the open editor's own heading says. */
export function useEditorLabel(screen: ReturnType<typeof useAdminScreen>) {
  const { t, i18n } = useTranslation('admin');
  const { editing } = screen;
  const locale = i18n.language;
  if (!editing) return '';
  switch (editing.type) {
    case 'ingredient':
      return screen.editedIngredient
        ? t('ingredient.edit', {
            name: localName(screen.editedIngredient, locale),
          })
        : t('ingredient.new');
    case 'aisle':
      return screen.editedAisle
        ? t('aisle.edit', { name: localName(screen.editedAisle, locale) })
        : t('aisle.new');
    case 'eatingMoment':
      return screen.editedEatingMoment
        ? t('eatingMoment.edit', {
            name: localName(screen.editedEatingMoment, locale),
          })
        : t('eatingMoment.new');
    case 'allergen':
      return screen.editedAllergen
        ? t('allergen.edit', {
            name: localName(screen.editedAllergen, locale),
          })
        : t('allergen.new');
    case 'tagGroup':
      return screen.editedTagGroup
        ? t('tagGroup.edit', {
            name: localName(screen.editedTagGroup, locale),
          })
        : t('tagGroup.new');
    case 'tag':
      return screen.editedTag
        ? t('tag.edit', { name: localName(screen.editedTag, locale) })
        : t('tag.new');
    case 'category': {
      const category = screen.editedCategory;
      if (editing.kind === 'parent') {
        return category
          ? t('category.editParent', { name: localName(category, locale) })
          : t('category.newParent');
      }
      return category
        ? t('category.editLeaf', { name: localName(category, locale) })
        : t('category.newLeaf');
    }
    case 'recipe':
      return t('recipe.new');
  }
}
