import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './api';
import type { Unit } from './catalog';
import { localIso } from './pantry';
import { postShoppingItems } from './plate';
import { shoppingListQueryKey, type NewShoppingItem } from './shopping';
import { suggestionsQueryKey } from './staples';

export type TemplateSummary = { id: string; name: string; lineCount: number };

export type TemplateLine = {
  id: string;
  ingredientId: string | null;
  name: string;
  quantity: number | null;
  unit: Unit | null;
  /** The typed name never matched a Catalog Ingredient. */
  unmatched: boolean;
  /** The Pantry holds an unexpired Batch of the Ingredient. */
  inPantry: boolean;
  aisle: { id: string; name: string; sortOrder: number } | null;
};

export type Template = { id: string; name: string; lines: TemplateLine[] };

export const MAX_TEMPLATES = 50;
export const MAX_TEMPLATE_LINES = 100;

const templatesKey = ['shopping-templates'] as const;
const withLocale = (locale: string) => `?${new URLSearchParams({ locale })}`;

export function useTemplates() {
  return useQuery({
    queryKey: templatesKey,
    queryFn: () =>
      apiRequest<{ templates: TemplateSummary[] }>('/shopping-templates').then(
        (body) => body.templates,
      ),
  });
}

export function useTemplate(id: string, locale: string) {
  return useQuery({
    queryKey: [...templatesKey, id, locale],
    queryFn: () =>
      apiRequest<Template>(
        `/shopping-templates/${id}?${new URLSearchParams({ locale, today: localIso(new Date()) })}`,
      ),
  });
}

/** A line as the body of a create or edit: by Ingredient id when matched, else by name. */
export const toLineBody = (line: TemplateLine): NewShoppingItem => ({
  ...(line.ingredientId
    ? { ingredientId: line.ingredientId }
    : { name: line.name }),
  ...(line.quantity !== null ? { quantity: line.quantity } : {}),
  ...(line.unit ? { unit: line.unit } : {}),
});

export function useTemplateMutations(locale: string) {
  const queryClient = useQueryClient();
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: templatesKey });

  const create = useMutation({
    mutationFn: (body: { name: string; lines?: NewShoppingItem[] }) =>
      apiRequest<Template>(`/shopping-templates${withLocale(locale)}`, {
        method: 'POST',
        body,
      }),
    onSuccess: refresh,
  });
  const createFromList = useMutation({
    mutationFn: (name: string) =>
      apiRequest<Template>(
        `/shopping-templates/from-list${withLocale(locale)}`,
        {
          method: 'POST',
          body: { name },
        },
      ),
    onSuccess: refresh,
  });
  const update = useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: string;
      name?: string;
      lines?: NewShoppingItem[];
    }) =>
      apiRequest<Template>(`/shopping-templates/${id}${withLocale(locale)}`, {
        method: 'PATCH',
        body,
      }),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (id: string) =>
      apiRequest<void>(`/shopping-templates/${id}`, { method: 'DELETE' }),
    onSuccess: refresh,
  });
  return { create, createFromList, update, remove };
}

/** Adds the ticked lines through the bulk endpoint (all or none); the server merges by the usual rule. */
export function useApplyTemplate(locale: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lines: TemplateLine[]) =>
      postShoppingItems(locale, lines.map(toLineBody)),
    // Suggestions hide while the Ingredient is on the list.
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: shoppingListQueryKey }),
        queryClient.invalidateQueries({ queryKey: suggestionsQueryKey }),
      ]),
  });
}
