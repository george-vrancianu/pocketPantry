import { createContext } from 'react';

/**
 * Set by a sheet that hosts an editor. `footer` is the pinned bar the editor's Save / Cancel go
 * into; `setTitle` hands the editor's heading to the sheet's header, so {@link EditorForm}
 * does not draw its own.
 */
export type EditorSheetSlot = {
  footer: HTMLElement | null;
  setTitle: (title: string) => void;
};

export const EditorSheetContext = createContext<EditorSheetSlot | null>(null);
