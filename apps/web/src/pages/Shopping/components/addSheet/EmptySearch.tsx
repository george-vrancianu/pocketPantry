import { Box } from '@pocket-pantry/ui';
import type { Suggestion, Suggestions } from '../../../../lib/suggestions';
import { GoneTiles } from './GoneTiles';
import { TemplateChips } from './TemplateChips';

export type EmptySearchProps = {
  suggestions: Suggestions;
  /** Selects a Gone tile's Ingredient through the search. */
  onPickGone: (suggestion: Suggestion) => void;
  /** Opens a template's apply view. */
  onOpenTemplate: (id: string) => void;
  /** Switches to the Templates tab. */
  onSeeAllTemplates: () => void;
};

/** What the Ingredients tab shows while the search is empty: what is gone from the Pantry, then Templates. */
export function EmptySearch(props: EmptySearchProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
      <GoneTiles suggestions={props.suggestions} onSelect={props.onPickGone} />
      <TemplateChips
        onOpenTemplate={props.onOpenTemplate}
        onSeeAll={props.onSeeAllTemplates}
      />
    </Box>
  );
}
