import { Inject, Injectable } from '@nestjs/common';
import type { CatalogLocale } from '../catalog/catalog.schemas';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { tags } from '../database/schema';
import { SettingsService } from '../settings/settings.service';
import { loadUsableTag, type RecipeTag } from './recipe-tags';
import { cleanTagName, findCatalogTag, findFamilyTag } from './tag-names';

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
    const { name, normalized } = cleanTagName(rawName);
    const familyId = await this.settings.familyIdOf(memberId);
    const scope = await this.settings.catalogScopeForMember(memberId);
    const id =
      (await findCatalogTag(this.database, normalized)) ??
      (await findFamilyTag(this.database, familyId, normalized)) ??
      (await this.createFamilyTag(familyId, name, normalized));
    return loadUsableTag(this.database, scope, locale, familyId, id);
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
    const existing = await findFamilyTag(this.database, familyId, normalized);
    if (!existing) throw new Error('Family Tag vanished after a name clash');
    return existing;
  }
}
