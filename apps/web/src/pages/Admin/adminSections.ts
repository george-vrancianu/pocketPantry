/** The Catalog sections, as the `admin/:section` URL names them. */
export const ADMIN_SECTIONS = [
  'ingredients',
  'allergens',
  'aisles',
  'categories',
  'recipes',
  'tags',
  'eating-moments',
] as const;

export type AdminSection = (typeof ADMIN_SECTIONS)[number];

export function asAdminSection(value: string | undefined): AdminSection | null {
  return ADMIN_SECTIONS.find((section) => section === value) ?? null;
}

export const CATALOG_TAB_URL = '/admin?tab=catalog';
