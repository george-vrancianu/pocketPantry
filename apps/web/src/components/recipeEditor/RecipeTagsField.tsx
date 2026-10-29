import { TagField, Typography } from '@pocket-pantry/ui';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePickableTags } from '../../lib/recipes';

/** Most Tags a Recipe can carry (ADR 0033); the API refuses the 11th too. */
export const MAX_RECIPE_TAGS = 10;

type Props = {
  /** `family`: Catalog Tags plus the Family's own. `admin`: Catalog Tags only. */
  scope: 'family' | 'admin';
  /** The picked Tag ids. */
  value: string[];
  onChange: (tagIds: string[]) => void;
};

/**
 * The Tag field of the Recipe editors (Family and Admin): the shared `TagField` as an inline
 * popup, one line at rest (two chips, then "+N"), no counts, grouped by Tag Group. It stops at
 * the 10-Tag cap and says so.
 */
export function RecipeTagsField({ scope, value, onChange }: Props) {
  const { t } = useTranslation('recipes');
  const options = usePickableTags(scope).data ?? [];
  // In option order (Your Tags first, then Tag Groups), like a row, not in id order.
  const picked = options.filter((tag) => value.includes(tag.id));
  // A Tag that is gone (e.g. a resumed Draft's) would make every Save fail: drop it once the
  // options are in.
  useEffect(() => {
    if (options.length > 0 && picked.length !== value.length)
      onChange(picked.map((tag) => tag.id));
  });
  return (
    <>
      <TagField
        list="popup"
        limitTags={2}
        options={options}
        value={picked}
        onChange={(next) => {
          if (next.length <= MAX_RECIPE_TAGS)
            onChange(next.map((tag) => tag.id));
        }}
        labels={{
          field: t('tags.editorField'),
          placeholder: t('tags.editorPlaceholder'),
          yourTags: t('tags.yourTags'),
          yourTagsNote: t('tags.yourTagsNote'),
          noOptions: t('tags.editorNoOptions'),
          clear: t('tags.clearAll'),
          remove: (name) => t('tags.remove', { name }),
          more: (count) => t('tags.more', { count }),
          optionCount: (count) => t('tags.optionCount', { count }),
        }}
      />
      {/* Always mounted, so a screen reader hears the cap when it is reached. */}
      <div role="status">
        {picked.length >= MAX_RECIPE_TAGS ? (
          <Typography variant="caption">
            {t('tags.editorLimit', { max: MAX_RECIPE_TAGS })}
          </Typography>
        ) : null}
      </div>
    </>
  );
}
