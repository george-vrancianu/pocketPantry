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

/** The Theme ids a Member can choose; the web app's Theme definitions use the same ids. */
export const THEME_IDS = ['warm', 'minimal', 'dark'] as const;
export type ThemeId = (typeof THEME_IDS)[number];

/** A partial save: whatever is omitted keeps its stored value. An empty body has nothing to update and is rejected. */
export const updatePreferencesBody = z
  .object({
    locale: z.enum(CATALOG_LOCALES).optional(),
    theme: z.enum(THEME_IDS).optional(),
  })
  .refine((body) => body.locale !== undefined || body.theme !== undefined, {
    message: 'Nothing to update',
  });
export type UpdatePreferencesBody = z.infer<typeof updatePreferencesBody>;

export type ExpiryOverrideView = {
  categoryId: string;
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
    leaves: { id: string; name: string }[];
  }[];
};

export type PreferencesView = {
  locale: (typeof CATALOG_LOCALES)[number] | null;
  theme: ThemeId | null;
};
