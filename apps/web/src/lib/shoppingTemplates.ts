import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './api';
import type { Unit } from './catalog';
import { localIso } from './pantry';
import { postShoppingItems } from './plate';
import { shoppingListQueryKey, type NewShoppingItem } from './shopping';
import { suggestionsQueryKey, templateDetailsQueryKey } from './queryKeys';

export type TemplateSummary = {
  id: string;
  name: string;
  lineCount: number;
  /** The first lines' names (at most 4) in stored order, localised. */
  previewNames: string[];
};

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

export function useTemplates(locale: string) {
  return useQuery({
    queryKey: [...templatesKey, 'list', locale],
    queryFn: () =>
      apiRequest<{ templates: TemplateSummary[] }>(
        `/shopping-templates${withLocale(locale)}`,
      ).then((body) => body.templates),
  });
}

/** The query behind one Template's details; `useTemplates`-style callers fetching several share its cache. */
export function templateQueryOptions(id: string, locale: string) {
  const today = localIso(new Date());
  return {
    queryKey: [...templateDetailsQueryKey, id, locale, today],
    queryFn: () =>
      apiRequest<Template>(
        `/shopping-templates/${id}?${new URLSearchParams({ locale, today })}`,
      ),
  };
}

export function useTemplate(id: string, locale: string) {
  return useQuery(templateQueryOptions(id, locale));
}

export type TemplateLineGroup = {
  key: string;
  title: string | null;
  lines: TemplateLine[];
};

/** Lines grouped by Aisle in shop order, Unmatched lines last. */
export function groupByAisle(lines: TemplateLine[]): TemplateLineGroup[] {
  const groups = new Map<string, TemplateLineGroup & { order: number }>();
  for (const line of lines) {
    const key = line.aisle?.id ?? 'unmatched';
    const group = groups.get(key) ?? {
      key,
      title: line.aisle?.name ?? null,
      order: line.aisle?.sortOrder ?? Number.MAX_SAFE_INTEGER,
      lines: [],
    };
    group.lines.push(line);
    groups.set(key, group);
  }
  return [...groups.values()].sort((a, b) => a.order - b.order);
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
    mutationFn: (body: NewShoppingItem[]) => postShoppingItems(locale, body),
    // Suggestions hide while the Ingredient is on the list.
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: shoppingListQueryKey }),
        queryClient.invalidateQueries({ queryKey: suggestionsQueryKey }),
      ]),
  });
}
