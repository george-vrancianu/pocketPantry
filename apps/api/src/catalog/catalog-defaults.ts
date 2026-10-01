import type { storageLocation } from '../database/schema';

export type StorageLocation = (typeof storageLocation.enumValues)[number];

export type ExpiryOverride = {
  entityType: 'parent_category' | 'leaf_category';
  entityId: string;
  days: number;
};

/**
 * Default Expiry in days for a Leaf under a Parent: a Family override wins over
 * the Catalog (Leaf override before Parent override), then the Catalog's Leaf
 * and Parent defaults.
 */
export function resolveExpiryDays(
  leaf: { id: string; defaultExpiryDays: number | null },
  parent: { id: string; defaultExpiryDays: number | null },
  overrides: readonly ExpiryOverride[],
): number | null {
  const find = (entityType: ExpiryOverride['entityType'], id: string) =>
    overrides.find((o) => o.entityType === entityType && o.entityId === id)
      ?.days;
  return (
    find('leaf_category', leaf.id) ??
    find('parent_category', parent.id) ??
    leaf.defaultExpiryDays ??
    parent.defaultExpiryDays
  );
}

type CategoryDefaults = {
  defaultExpiryDays: number | null;
  defaultLocation: StorageLocation | null;
};

export type ResolvedCatalogDefaults = {
  expiryDays: number | null;
  location: StorageLocation | null;
};

/** Default Expiry and default Location: the Leaf Category's, else its Parent Category's, per field. */
export function resolveCatalogDefaults(
  leaf: CategoryDefaults,
  parent: CategoryDefaults,
): ResolvedCatalogDefaults {
  return {
    expiryDays: leaf.defaultExpiryDays ?? parent.defaultExpiryDays,
    location: leaf.defaultLocation ?? parent.defaultLocation,
  };
}
