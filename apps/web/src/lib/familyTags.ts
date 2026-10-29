import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './api';
import { recipesQueryKey } from './recipes';

/** Longest Tag name; the API checks it too (ADR 0033). */
export const MAX_TAG_NAME_LENGTH = 30;

/** A Family Tag with how many of the Family's Recipes carry it. */
export type ManagedTag = { id: string; name: string; recipeCount: number };

/** What a delete removed: enough to put exactly those links back. */
export type DeletedTag = {
  tag: { id: string; name: string };
  recipeIds: string[];
  recipeCount: number;
};

export type RenamedTag = ManagedTag & { merged: boolean };

/** Undo's answer; `restoredLinks` is how many links came back (skips are silent). */
export type RestoredTag = ManagedTag & { restoredLinks: number };

const familyTagsQueryKey = [...recipesQueryKey, 'family-tags'] as const;

/** The Family's own Tags with Recipe counts (Manage Tags in Settings). */
export function useFamilyTags() {
  return useQuery({
    queryKey: familyTagsQueryKey,
    queryFn: () => apiRequest<ManagedTag[]>('/recipes/tags/family'),
  });
}

/**
 * Tags and the Recipes carrying them changed: the Tag pickers, Recipe lists and filters all live
 * under the recipes key, so one invalidation refreshes them (and this list).
 */
function useRefreshRecipes() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: recipesQueryKey });
}

/** Renames a Family Tag. Without `merge`, a name another Tag has fails with `tags.name_taken`. */
export function useRenameFamilyTag() {
  const refresh = useRefreshRecipes();
  return useMutation({
    mutationFn: (input: { id: string; name: string; merge: boolean }) =>
      apiRequest<RenamedTag>(`/recipes/tags/${input.id}`, {
        method: 'PATCH',
        body: { name: input.name, merge: input.merge },
      }),
    onSuccess: refresh,
  });
}

export function useDeleteFamilyTag() {
  const refresh = useRefreshRecipes();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<DeletedTag>(`/recipes/tags/${id}`, { method: 'DELETE' }),
    onSuccess: refresh,
  });
}

/** Undo of a delete: the Tag and exactly the links the delete removed. */
export function useRestoreFamilyTag() {
  const refresh = useRefreshRecipes();
  return useMutation({
    mutationFn: (deleted: DeletedTag) =>
      apiRequest<RestoredTag>('/recipes/tags/restore', {
        method: 'POST',
        body: {
          id: deleted.tag.id,
          name: deleted.tag.name,
          recipeIds: deleted.recipeIds,
        },
      }),
    onSuccess: refresh,
  });
}
