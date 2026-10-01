import { z } from 'zod';
import { CATALOG_LOCALES, FALLBACK_LOCALE } from '../catalog/catalog.schemas';

export const settingsLocaleQuery = z.object({
  locale: z.enum(CATALOG_LOCALES).default(FALLBACK_LOCALE),
});
export type SettingsLocaleQuery = z.infer<typeof settingsLocaleQuery>;

export const categoryIdParam = z.uuid();

export const updateFamilySettingsBody = z.object({
  staleThresholdDays: z.number().int().min(1).max(365),
});
export type UpdateFamilySettingsBody = z.infer<typeof updateFamilySettingsBody>;

export const expiryOverrideBody = z.object({
  days: z.number().int().min(1).max(3650),
});
export type ExpiryOverrideBody = z.infer<typeof expiryOverrideBody>;

export const updatePreferencesBody = z.object({
  locale: z.enum(CATALOG_LOCALES),
});
export type UpdatePreferencesBody = z.infer<typeof updatePreferencesBody>;

export type ExpiryOverrideView = {
  categoryId: string;
  kind: 'parent' | 'leaf';
  /** Localised Category name. */
  name: string;
  days: number;
};

export type FamilySettingsView = {
  staleThresholdDays: number;
  expiryOverrides: ExpiryOverrideView[];
};

export type CategoryOptionsView = {
  parents: {
    id: string;
    name: string;
    defaultExpiryDays: number | null;
    leaves: { id: string; name: string; defaultExpiryDays: number | null }[];
  }[];
};

export type PreferencesView = {
  locale: (typeof CATALOG_LOCALES)[number] | null;
};
