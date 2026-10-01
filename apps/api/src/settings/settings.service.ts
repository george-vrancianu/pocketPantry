import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import type { ExpiryOverride } from '../catalog/catalog-defaults';
import {
  CATALOG_LOCALES,
  type CatalogLocale,
} from '../catalog/catalog.schemas';
import { loadDisplayNames } from '../catalog/display-names';
import { ApiException } from '../common/api-exception';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import {
  family,
  familyExpiryOverrides,
  leafCategories,
  parentCategories,
  user,
} from '../database/schema';
import type {
  CategoryOptionsView,
  ExpiryOverrideView,
  FamilySettingsView,
  PreferencesView,
} from './settings.schemas';

/** Family Settings (shared by every Member of a Family) and Member Preferences (private). */
@Injectable()
export class SettingsService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async familyIdOf(memberId: string): Promise<string> {
    const [self] = await this.database
      .select({ familyId: user.familyId })
      .from(user)
      .where(eq(user.id, memberId))
      .limit(1);
    if (!self) throw new ApiException(401, 'auth.unauthenticated');
    return self.familyId;
  }

  expiryOverridesForMember(memberId: string): Promise<ExpiryOverride[]> {
    return this.familyIdOf(memberId).then((id) => this.expiryOverridesOf(id));
  }

  /** The Family's Default Expiry overrides, for resolving a Category's expiry. */
  async expiryOverridesOf(familyId: string): Promise<ExpiryOverride[]> {
    return this.database
      .select({
        entityType: familyExpiryOverrides.entityType,
        entityId: familyExpiryOverrides.entityId,
        days: familyExpiryOverrides.days,
      })
      .from(familyExpiryOverrides)
      .where(eq(familyExpiryOverrides.familyId, familyId))
      .then((rows) =>
        rows.flatMap((row) =>
          row.entityType === 'parent_category' ||
          row.entityType === 'leaf_category'
            ? [{ ...row, entityType: row.entityType }]
            : [],
        ),
      );
  }

  async staleThresholdOf(familyId: string): Promise<number> {
    const [row] = await this.database
      .select({ days: family.staleThresholdDays })
      .from(family)
      .where(eq(family.id, familyId))
      .limit(1);
    return row?.days ?? 3;
  }

  async getFamilySettings(
    memberId: string,
    locale: CatalogLocale,
  ): Promise<FamilySettingsView> {
    const familyId = await this.familyIdOf(memberId);
    const overrides = await this.expiryOverridesOf(familyId);
    const names = await loadDisplayNames(
      this.database,
      locale,
      overrides.map((o) => o.entityId),
    );
    const canonical = await this.canonicalNames(
      overrides.map((o) => o.entityId),
    );
    const views: ExpiryOverrideView[] = overrides.map((o) => ({
      categoryId: o.entityId,
      kind: o.entityType === 'leaf_category' ? 'leaf' : 'parent',
      name: names.pick(
        o.entityType,
        o.entityId,
        canonical.get(o.entityId) ?? '',
      ),
      days: o.days,
    }));
    views.sort((a, b) => a.name.localeCompare(b.name, locale));
    return {
      staleThresholdDays: await this.staleThresholdOf(familyId),
      expiryOverrides: views,
    };
  }

  async setStaleThreshold(memberId: string, days: number): Promise<void> {
    const familyId = await this.familyIdOf(memberId);
    await this.database
      .update(family)
      .set({ staleThresholdDays: days })
      .where(eq(family.id, familyId));
  }

  async setExpiryOverride(
    memberId: string,
    categoryId: string,
    days: number,
  ): Promise<void> {
    const familyId = await this.familyIdOf(memberId);
    const entityType = await this.categoryType(categoryId);
    await this.database
      .insert(familyExpiryOverrides)
      .values({ familyId, entityType, entityId: categoryId, days })
      .onConflictDoUpdate({
        target: [
          familyExpiryOverrides.familyId,
          familyExpiryOverrides.entityType,
          familyExpiryOverrides.entityId,
        ],
        set: { days, updatedAt: new Date() },
      });
  }

  async removeExpiryOverride(
    memberId: string,
    categoryId: string,
  ): Promise<void> {
    const familyId = await this.familyIdOf(memberId);
    await this.database
      .delete(familyExpiryOverrides)
      .where(
        and(
          eq(familyExpiryOverrides.familyId, familyId),
          eq(familyExpiryOverrides.entityId, categoryId),
        ),
      );
  }

  /** Parent Categories with their Leaf Categories: what an override can target. */
  async categoryOptions(locale: CatalogLocale): Promise<CategoryOptionsView> {
    const parents = await this.database
      .select()
      .from(parentCategories)
      .orderBy(asc(parentCategories.normalizedName));
    const leaves = await this.database
      .select()
      .from(leafCategories)
      .orderBy(asc(leafCategories.normalizedName));
    const names = await loadDisplayNames(this.database, locale, [
      ...parents.map((p) => p.id),
      ...leaves.map((l) => l.id),
    ]);
    const byName = (a: { name: string }, b: { name: string }) =>
      a.name.localeCompare(b.name, locale);
    return {
      parents: parents
        .map((parent) => ({
          id: parent.id,
          name: names.pick('parent_category', parent.id, parent.name),
          defaultExpiryDays: parent.defaultExpiryDays,
          leaves: leaves
            .filter((leaf) => leaf.parentId === parent.id)
            .map((leaf) => ({
              id: leaf.id,
              name: names.pick('leaf_category', leaf.id, leaf.name),
              defaultExpiryDays: leaf.defaultExpiryDays,
            }))
            .sort(byName),
        }))
        .sort(byName),
    };
  }

  async getPreferences(memberId: string): Promise<PreferencesView> {
    const [row] = await this.database
      .select({ locale: user.locale })
      .from(user)
      .where(eq(user.id, memberId))
      .limit(1);
    if (!row) throw new ApiException(401, 'auth.unauthenticated');
    const locale = CATALOG_LOCALES.find((l) => l === row.locale) ?? null;
    return { locale };
  }

  async setLocale(memberId: string, locale: CatalogLocale): Promise<void> {
    await this.database
      .update(user)
      .set({ locale })
      .where(eq(user.id, memberId));
  }

  private async categoryType(
    categoryId: string,
  ): Promise<'parent_category' | 'leaf_category'> {
    const [leaf] = await this.database
      .select({ id: leafCategories.id })
      .from(leafCategories)
      .where(eq(leafCategories.id, categoryId))
      .limit(1);
    if (leaf) return 'leaf_category';
    const [parent] = await this.database
      .select({ id: parentCategories.id })
      .from(parentCategories)
      .where(eq(parentCategories.id, categoryId))
      .limit(1);
    if (parent) return 'parent_category';
    throw new ApiException(404, 'settings.category_not_found');
  }

  private async canonicalNames(ids: string[]): Promise<Map<string, string>> {
    if (ids.length === 0) return new Map();
    const [leaves, parents] = await Promise.all([
      this.database
        .select({ id: leafCategories.id, name: leafCategories.name })
        .from(leafCategories),
      this.database
        .select({ id: parentCategories.id, name: parentCategories.name })
        .from(parentCategories),
    ]);
    return new Map([...leaves, ...parents].map((c) => [c.id, c.name]));
  }
}
