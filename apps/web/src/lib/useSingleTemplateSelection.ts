import { useState } from 'react';
import type { ShoppingList } from './shopping';
import type { Template, TemplateLine } from './shoppingTemplates';
import {
  emptySelection,
  includeTemplate,
  isLineTicked,
  tickedLines,
  toggleLine,
  type Selection,
} from './templateSelection';

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
