import { createContext, useContext } from 'react';
import type { CatalogAisle } from '../../lib/catalog';

/**
 * What the enclosing CatalogSearch offers an empty-state block that wants to
 * drive it. `CatalogSearch` provides it around its `emptyState`; the block
 * reads it with `useCatalogSearchBrowse` (null outside a CatalogSearch).
 */
export type CatalogSearchBrowse = {
  /** The search's scope, so the block lists the same Catalog the search reads. */
  scope: 'family' | 'shared';
  /** Opens the aisle view in the search's own list; the search owns the view from there. */
  openAisle: (aisle: CatalogAisle) => void;
};

export const CatalogSearchBrowseContext =
  createContext<CatalogSearchBrowse | null>(null);

export const useCatalogSearchBrowse = () =>
  useContext(CatalogSearchBrowseContext);
