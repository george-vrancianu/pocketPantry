import { Inject, Injectable } from '@nestjs/common';
import {
  and,
  count,
  countDistinct,
  eq,
  inArray,
  isNull,
  ne,
  sql,
} from 'drizzle-orm';
import { ApiException } from '../common/api-exception';
import type { CatalogLocale } from '../catalog/catalog.schemas';
import { DATABASE } from '../database/database.constants';
import type { Database, Executor, Tx } from '../database/database.types';
import { recipes, recipeTags, tags } from '../database/schema';
import { MAX_RECIPE_TAGS } from '../recipes/recipes.schemas';
import { SettingsService } from '../settings/settings.service';
import type {
  DeletedTag,
  ManagedTag,
  RenamedTag,
  RestoredTag,
} from './family-tags.schemas';
import { foldTagsInto } from './merge-tags';
import { loadUsableTag } from './recipe-tags';
import { cleanTagName, findCatalogTag, findFamilyTag } from './tag-names';

const tagNotFound = () => new ApiException(404, 'tags.not_found');

/**
 * Tidying a Family's own Tags (spec #706): list with usage, rename (merging into a same-named Tag
 * only when the caller says so), delete with enough to undo it, and restore. Catalog Tags and other
 * Families' Tags are never touched: they answer 404 `tags.not_found`.
 */
@Injectable()
export class ManageFamilyTagsService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly settings: SettingsService,
  ) {}

  async list(memberId: string): Promise<ManagedTag[]> {
    const familyId = await this.settings.familyIdOf(memberId);
    const rows = await this.database
      .select({
        id: tags.id,
        name: tags.name,
        recipeCount: countDistinct(recipes.id),
      })
      .from(tags)
      .leftJoin(recipeTags, eq(recipeTags.tagId, tags.id))
      .leftJoin(
        recipes,
        and(
          eq(recipes.id, recipeTags.recipeId),
          eq(recipes.familyId, familyId),
          isNull(recipes.archivedAt),
        ),
      )
      .where(eq(tags.familyId, familyId))
      .groupBy(tags.id, tags.name, tags.normalizedName)
      .orderBy(tags.normalizedName, tags.id);
    return rows;
  }

  /**
   * Error codes: `tags.not_found` (404), `tags.name_required` / `tags.name_too_long` (400),
   * `tags.name_taken` (409, `{ id }` of the Tag that has the name) unless `merge`.
   */
  async rename(
    memberId: string,
    locale: CatalogLocale,
    tagId: string,
    rawName: string,
    merge: boolean,
  ): Promise<RenamedTag> {
    const { name, normalized } = cleanTagName(rawName);
    const familyId = await this.settings.familyIdOf(memberId);
    const scope = await this.settings.catalogScopeForMember(memberId);
    return this.database.transaction(async (tx) => {
      await this.lockOwn(tx, familyId, tagId);
      // A Catalog Tag wins: a Family never keeps a Tag a Catalog Tag already names.
      const survivorId =
        (await findCatalogTag(tx, normalized)) ??
        (await this.otherFamilyTag(tx, familyId, tagId, normalized));
      if (survivorId === null) {
        await tx
          .update(tags)
          .set({ name, normalizedName: normalized })
          .where(eq(tags.id, tagId));
        return {
          id: tagId,
          name,
          recipeCount: await this.usage(tx, familyId, tagId),
          merged: false,
        };
      }
      if (!merge) {
        throw new ApiException(409, 'tags.name_taken', { id: survivorId });
      }
      await tx
        .select({ id: tags.id })
        .from(tags)
        .where(eq(tags.id, survivorId))
        .for('key share');
      await foldTagsInto(tx, survivorId, [tagId]);
      const survivor = await loadUsableTag(
        tx,
        scope,
        locale,
        familyId,
        survivorId,
      );
      return {
        id: survivorId,
        name: survivor.name,
        recipeCount: await this.usage(tx, familyId, survivorId),
        merged: true,
      };
    });
  }

  async remove(memberId: string, tagId: string): Promise<DeletedTag> {
    const familyId = await this.settings.familyIdOf(memberId);
    return this.database.transaction(async (tx) => {
      const tag = await this.lockOwn(tx, familyId, tagId);
      const links = await tx
        .select({ id: recipeTags.recipeId, archivedAt: recipes.archivedAt })
        .from(recipeTags)
        .innerJoin(recipes, eq(recipes.id, recipeTags.recipeId))
        .where(eq(recipeTags.tagId, tagId))
        .orderBy(recipeTags.recipeId);
      // The links go with the Tag (cascade); what is returned is exactly what was removed.
      await tx.delete(tags).where(eq(tags.id, tagId));
      return {
        tag: { id: tag.id, name: tag.name },
        recipeIds: links.map((l) => l.id),
        recipeCount: links.filter((l) => l.archivedAt === null).length,
      };
    });
  }

  /**
   * Recreates the Tag with its old id and exactly the given links. Skipped: Recipes that no longer
   * exist or are not the Family's, and Recipes already at the Tag cap. If the name was taken in the
   * meantime (by a Family Tag, or a Catalog Tag in any language) the links go to that Tag instead,
   * so Undo never fails and never creates a duplicate. Restoring twice adds nothing.
   */
  async restore(
    memberId: string,
    locale: CatalogLocale,
    input: { id: string; name: string; recipeIds: string[] },
  ): Promise<RestoredTag> {
    const { name, normalized } = cleanTagName(input.name);
    const familyId = await this.settings.familyIdOf(memberId);
    const scope = await this.settings.catalogScopeForMember(memberId);
    return this.database.transaction(async (tx) => {
      const tagId = await this.targetOfRestore(
        tx,
        familyId,
        input.id,
        name,
        normalized,
      );
      const wanted = [...new Set(input.recipeIds)];
      const candidates =
        wanted.length === 0
          ? []
          : await tx
              .select({ id: recipes.id })
              .from(recipes)
              .where(
                and(
                  inArray(recipes.id, wanted),
                  eq(recipes.familyId, familyId),
                ),
              )
              .orderBy(recipes.id)
              .for('share');
      let restored = 0;
      if (candidates.length > 0) {
        const ids = candidates.map((r) => r.id);
        const full = await tx
          .select({ id: recipeTags.recipeId })
          .from(recipeTags)
          .where(inArray(recipeTags.recipeId, ids))
          .groupBy(recipeTags.recipeId)
          .having(sql`count(*) >= ${MAX_RECIPE_TAGS}`);
        const skip = new Set(full.map((r) => r.id));
        const linkable = ids.filter((id) => !skip.has(id));
        if (linkable.length > 0) {
          const added = await tx
            .insert(recipeTags)
            .values(linkable.map((recipeId) => ({ recipeId, tagId })))
            .onConflictDoNothing()
            .returning({ recipeId: recipeTags.recipeId });
          restored = added.length;
        }
      }
      const shown = await loadUsableTag(tx, scope, locale, familyId, tagId);
      return {
        id: shown.id,
        name: shown.name,
        recipeCount: await this.usage(tx, familyId, tagId),
        restoredLinks: restored,
      };
    });
  }

  private async targetOfRestore(
    tx: Tx,
    familyId: string,
    id: string,
    name: string,
    normalized: string,
  ): Promise<string> {
    const [existing] = await tx
      .select({ id: tags.id, familyId: tags.familyId })
      .from(tags)
      .where(eq(tags.id, id));
    if (existing) {
      if (existing.familyId !== familyId) throw tagNotFound();
      return existing.id;
    }
    const taken =
      (await findCatalogTag(tx, normalized)) ??
      (await findFamilyTag(tx, familyId, normalized));
    if (taken) return taken;
    const [created] = await tx
      .insert(tags)
      .values({ id, name, normalizedName: normalized, familyId })
      .onConflictDoNothing()
      .returning({ id: tags.id });
    if (created) return created.id;
    const raced = await findFamilyTag(tx, familyId, normalized);
    if (!raced) throw tagNotFound();
    return raced;
  }

  /** Locks the Family's own Tag so Recipe saves and other edits wait; 404 for anything else. */
  private async lockOwn(tx: Tx, familyId: string, tagId: string) {
    const [tag] = await tx
      .select({ id: tags.id, name: tags.name })
      .from(tags)
      .where(and(eq(tags.id, tagId), eq(tags.familyId, familyId)))
      .for('update');
    if (!tag) throw tagNotFound();
    return tag;
  }

  private async otherFamilyTag(
    tx: Tx,
    familyId: string,
    tagId: string,
    normalized: string,
  ): Promise<string | null> {
    const [row] = await tx
      .select({ id: tags.id })
      .from(tags)
      .where(
        and(
          eq(tags.familyId, familyId),
          eq(tags.normalizedName, normalized),
          ne(tags.id, tagId),
        ),
      );
    return row?.id ?? null;
  }

  private async usage(
    executor: Executor,
    familyId: string,
    tagId: string,
  ): Promise<number> {
    const [row] = await executor
      .select({ n: count() })
      .from(recipeTags)
      .innerJoin(recipes, eq(recipes.id, recipeTags.recipeId))
      .where(
        and(
          eq(recipeTags.tagId, tagId),
          eq(recipes.familyId, familyId),
          isNull(recipes.archivedAt),
        ),
      );
    return row.n;
  }
}
