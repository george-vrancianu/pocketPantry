import { useState } from 'react';
import { normalizeName } from './normalizeName';
import {
  isOnList,
  type NewShoppingItem,
  type ShoppingItem,
  type ShoppingList,
} from './shopping';
import {
  toLineBody,
  type Template,
  type TemplateLine,
} from './shoppingTemplates';

/**
 * Which Template Lines of which Shopping Templates a Member is about to apply.
 * Pure functions over a set of Template details and the current Shopping List,
 * shared by the editor's Apply picker (one Template) and the Import sheet
 * (several). A Template is absent from the map when excluded; otherwise it maps
 * to the ids of its ticked lines.
 */
export type Selection = ReadonlyMap<string, ReadonlySet<string>>;

export const emptySelection: Selection = new Map();

/** Why a line is worth a second look, in priority order. */
export type LineTag = 'inPantry' | 'inTrolley' | 'onList';

export type TemplateState = 'excluded' | 'all' | 'mixed';

/** The bulk-add endpoint takes at most this many items (MAX_BULK_SHOPPING_ITEMS in the API). */
export const MAX_APPLY_ITEMS = 100;

const items = (list: ShoppingList | undefined): ShoppingItem[] =>
  (list?.groups ?? []).flatMap((group) => group.items);

/**
 * In Pantry, else In trolley (a checked Shopping Item with the same identity;
 * the server's merge would uncheck it), else On list (an unchecked one, whose
 * quantity the line would add to). Identity is the server's merge rule: the
 * same Ingredient, or for Unmatched lines the same normalised name.
 */
export function lineTag(
  line: TemplateLine,
  list: ShoppingList | undefined,
): LineTag | null {
  if (line.inPantry) return 'inPantry';
  const matches = items(list).filter((item) => isOnList(item, line));
  if (matches.some((item) => item.checked)) return 'inTrolley';
  if (matches.length > 0) return 'onList';
  return null;
}

/** Lines in the Pantry or in the trolley start unticked; everything else ticked. */
const defaultTicked = (line: TemplateLine, list: ShoppingList | undefined) => {
  const tag = lineTag(line, list);
  return tag !== 'inPantry' && tag !== 'inTrolley';
};

/** Includes the Template with its default selection. */
export function includeTemplate(
  selection: Selection,
  template: Template,
  list: ShoppingList | undefined,
): Selection {
  return new Map(selection).set(
    template.id,
    new Set(
      template.lines.filter((l) => defaultTicked(l, list)).map((l) => l.id),
    ),
  );
}

/** Drops the whole Template; a hand-picked selection is not remembered. */
export function removeTemplate(
  selection: Selection,
  templateId: string,
): Selection {
  const next = new Map(selection);
  next.delete(templateId);
  return next;
}

/**
 * The tick on a Template row: includes an excluded Template with its default
 * selection, removes an included one.
 */
export function toggleTemplate(
  selection: Selection,
  template: Template,
  list: ShoppingList | undefined,
): Selection {
  return selection.has(template.id)
    ? removeTemplate(selection, template.id)
    : includeTemplate(selection, template, list);
}

/**
 * A tap on a line. On an excluded Template it includes the Template with its
 * default selection plus the tapped line. Unticking the last ticked line
 * removes the Template, unless `keepWhenEmpty` (a single-Template picker that
 * lets the Member untick everything).
 */
export function toggleLine(
  selection: Selection,
  template: Template,
  line: TemplateLine,
  list: ShoppingList | undefined,
  { keepWhenEmpty = false }: { keepWhenEmpty?: boolean } = {},
): Selection {
  const current = selection.get(template.id);
  if (!current) {
    const included = includeTemplate(selection, template, list);
    return new Map(included).set(
      template.id,
      new Set([...(included.get(template.id) ?? []), line.id]),
    );
  }
  const ticked = new Set(current);
  if (!ticked.delete(line.id)) ticked.add(line.id);
  if (ticked.size === 0 && !keepWhenEmpty) {
    return removeTemplate(selection, template.id);
  }
  return new Map(selection).set(template.id, ticked);
}

export function templateState(
  selection: Selection,
  template: Template,
): TemplateState {
  const ticked = selection.get(template.id);
  if (!ticked) return 'excluded';
  return template.lines.length > 0 && ticked.size === template.lines.length
    ? 'all'
    : 'mixed';
}

export const isLineTicked = (
  selection: Selection,
  templateId: string,
  lineId: string,
): boolean => selection.get(templateId)?.has(lineId) ?? false;

/** The ticked lines of every included Template, in the order given. */
export function tickedLines(
  selection: Selection,
  templates: readonly Template[],
): TemplateLine[] {
  return templates.flatMap((template) =>
    template.lines.filter((line) =>
      isLineTicked(selection, template.id, line.id),
    ),
  );
}

/** The bulk-add body: ticked lines as they are, Unmatched ones by name. The server merges repeats. */
export const bulkBody = (
  selection: Selection,
  templates: readonly Template[],
): NewShoppingItem[] => tickedLines(selection, templates).map(toLineBody);

const identityOf = (line: TemplateLine) =>
  line.ingredientId
    ? `i:${line.ingredientId}`
    : `n:${normalizeName(line.name)}`;

export type SelectionSummary = {
  /** Included Templates with at least one ticked line. */
  templates: Template[];
  /** Distinct Ingredients or normalised Unmatched names, ignoring unit. */
  items: number;
  /** Ticked lines folded into another by the same identity (any unit). */
  repeats: number;
  /** More than MAX_APPLY_ITEMS after combining same identity and unit. */
  overCap: boolean;
};

export function summarize(
  selection: Selection,
  templates: readonly Template[],
): SelectionSummary {
  const lines = tickedLines(selection, templates);
  const identities = new Set(lines.map(identityOf));
  const combined = new Set(
    lines.map((l) => `${identityOf(l)}|${l.unit ?? ''}`),
  );
  return {
    templates: templates.filter((template) =>
      template.lines.some((l) => isLineTicked(selection, template.id, l.id)),
    ),
    items: identities.size,
    repeats: lines.length - identities.size,
    overCap: combined.size > MAX_APPLY_ITEMS,
  };
}

/**
 * The selection of a single Template (the editor's Apply picker, the Add
 * sheet's apply view). Starts as the default selection of the Template and
 * the current list; once the Member taps a line it is theirs, so a list
 * refetch no longer moves their ticks. They may untick every line.
 */
export function useSingleTemplateSelection(
  template: Template,
  list: ShoppingList | undefined,
) {
  const [touched, setTouched] = useState<Selection | null>(null);
  const selection = touched ?? includeTemplate(emptySelection, template, list);
  return {
    selection,
    isTicked: (line: TemplateLine) =>
      isLineTicked(selection, template.id, line.id),
    ticked: tickedLines(selection, [template]),
    toggle: (line: TemplateLine) =>
      setTouched(
        toggleLine(selection, template, line, list, { keepWhenEmpty: true }),
      ),
  };
}
