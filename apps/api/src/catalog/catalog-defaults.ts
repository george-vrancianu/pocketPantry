import type { storageLocation } from '../database/schema';

export type StorageLocation = (typeof storageLocation.enumValues)[number];

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
