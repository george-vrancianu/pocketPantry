import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import { ApiException } from '../common/api-exception';
import type { CatalogLocale } from '../catalog/catalog.schemas';
import { normalizeName } from '../catalog/normalize';
import { DATABASE } from '../database/database.constants';
import type { Database, Executor } from '../database/database.types';
import { catalogTranslations, tags } from '../database/schema';
import { SettingsService } from '../settings/settings.service';
import { loadUsableTag, type RecipeTag } from './recipe-tags';

/** Longest Tag name (ADR 0033), counted after trimming. */
export const MAX_TAG_NAME_LENGTH = 30;

/**
 * Turns what a Member typed into a Tag (ADR 0033, "one name, one Tag"): a Catalog Tag whose source
 * name or any translation matches, else the Family's own Tag, else a new Family Tag. Names are
 * compared with `normalizeName` (case, accents, whitespace and hyphens), the same rule that keys
 * the stored `normalized_name` columns, so every path that resolves a Tag name agrees.
 *
 * Error codes: `tags.name_required` (400), `tags.name_too_long` (400, `{ max }`).
 */
@Injectable()
export class FamilyTagsService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly settings: SettingsService,
  ) {}

  async resolveName(
    memberId: string,
    locale: CatalogLocale,
    rawName: string,
  ): Promise<RecipeTag> {
    const name = rawName.trim().replace(/\s+/g, ' ');
    const normalized = normalizeName(name);
    if (normalized === '') throw new ApiException(400, 'tags.name_required');
    if ([...name].length > MAX_TAG_NAME_LENGTH) {
      throw new ApiException(400, 'tags.name_too_long', {
        max: MAX_TAG_NAME_LENGTH,
      });
    }
    const familyId = await this.settings.familyIdOf(memberId);
    const scope = await this.settings.catalogScopeForMember(memberId);
    const id =
      (await this.findCatalogTag(this.database, normalized)) ??
      (await this.findFamilyTag(this.database, familyId, normalized)) ??
      (await this.createFamilyTag(familyId, name, normalized));
    return loadUsableTag(this.database, scope, locale, familyId, id);
  }

  private async findCatalogTag(
    executor: Executor,
    normalized: string,
  ): Promise<string | null> {
    const [byName] = await executor
      .select({ id: tags.id })
      .from(tags)
      .where(and(isNull(tags.familyId), eq(tags.normalizedName, normalized)));
    if (byName) return byName.id;
    // Display names and shared Synonyms in every language; a Family's own Synonyms do not count.
    const [byTranslation] = await executor
      .select({ id: catalogTranslations.entityId })
      .from(catalogTranslations)
      .innerJoin(tags, eq(tags.id, catalogTranslations.entityId))
      .where(
        and(
          eq(catalogTranslations.entityType, 'tag'),
          eq(catalogTranslations.normalizedValue, normalized),
          isNull(catalogTranslations.ownerFamilyId),
          isNull(tags.familyId),
        ),
      )
      .orderBy(catalogTranslations.entityId)
      .limit(1);
    return byTranslation?.id ?? null;
  }

  private async findFamilyTag(
    executor: Executor,
    familyId: string,
    normalized: string,
  ): Promise<string | null> {
    const [row] = await executor
      .select({ id: tags.id })
      .from(tags)
      .where(
        and(eq(tags.familyId, familyId), eq(tags.normalizedName, normalized)),
      );
    return row?.id ?? null;
  }

  private async createFamilyTag(
    familyId: string,
    name: string,
    normalized: string,
  ): Promise<string> {
    const [created] = await this.database
      .insert(tags)
      .values({
        id: crypto.randomUUID(),
        name,
        normalizedName: normalized,
        familyId,
      })
      .onConflictDoNothing()
      .returning({ id: tags.id });
    if (created) return created.id;
    // A concurrent request made the same Tag first: use it.
    const existing = await this.findFamilyTag(
      this.database,
      familyId,
      normalized,
    );
    if (!existing) throw new Error('Family Tag vanished after a name clash');
    return existing;
  }
}
