import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import type { CatalogLocale } from '../catalog/catalog.schemas';
import { catalogScope, type CatalogScope } from '../catalog/catalog-scope';
import { loadDisplayNames } from '../catalog/display-names';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { recipes } from '../database/schema';
import { SettingsService } from '../settings/settings.service';
import { utcToday } from '../shopping/batch-presence';
import { compareRecipeMatches, type LineMatch } from './matching/pantry-match';
import {
  PantryMatchingService,
  type PantryRecipeMatch,
} from './matching/pantry-matching.service';
import {
  loadAllergyWarnings,
  loadViewerAllergyContext,
} from './recipe-allergens';
import { inScope, ownerOf, recipeTitles, visibleTo } from './recipe-view';
import type {
  CookTonightCard,
  CookTonightQuery,
  CookTonightView,
} from './recipes.schemas';

type RecipeRow = typeof recipes.$inferSelect;
type Candidate = { row: RecipeRow; title: string; match: PantryRecipeMatch };

/** Cook Tonight: what the Family's Pantry can make, one card per Base Recipe. */
@Injectable()
export class CookTonightService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly settings: SettingsService,
    private readonly matching: PantryMatchingService,
  ) {}

  async view(
    memberId: string,
    query: CookTonightQuery,
    locale: CatalogLocale,
  ): Promise<CookTonightView> {
    const familyId = await this.settings.familyIdOf(memberId);
    const rows = await this.database
      .select()
      .from(recipes)
      .where(and(inScope(familyId, query.scope), isNull(recipes.archivedAt)));
    const matches = await this.matching.matchRecipes(
      familyId,
      rows.map((r) => r.id),
      { today: query.today ?? utcToday() },
    );

    const qualifying = rows.filter((row) => {
      const match = matches.get(row.id);
      return match && (match.canMake || match.shortOrMissingCount === 1);
    });
    if (qualifying.length === 0)
      return { cards: [], hiddenByAllergiesCount: 0 };

    // A Family Variant of a Catalog Base is grouped under the Family's live copy of that Base.
    const copyOf = await this.liveCopyIds(
      familyId,
      query.scope === 'family'
        ? qualifying.flatMap((r) => (r.parentId ? [r.parentId] : []))
        : [],
    );
    const groups = new Map<string, RecipeRow[]>();
    for (const row of qualifying) {
      const key = row.parentId
        ? (copyOf.get(row.parentId) ?? row.parentId)
        : row.id;
      groups.set(key, [...(groups.get(key) ?? []), row]);
    }
    // Bases that are not themselves candidates (archived) still title the card.
    const baseIds = [...groups.keys()];
    const baseRows = await this.database
      .select()
      .from(recipes)
      .where(and(inArray(recipes.id, baseIds), visibleTo(familyId)));
    const baseById = new Map(baseRows.map((r) => [r.id, r]));

    const titles = await recipeTitles(
      this.database,
      [...qualifying, ...baseRows],
      locale,
    );
    // Best first: the Pantry ranking, then title, then id for a stable order.
    const byRank = (a: Candidate, b: Candidate) =>
      compareRecipeMatches(a.match, b.match) ||
      a.title.localeCompare(b.title, locale) ||
      a.row.id.localeCompare(b.row.id);

    const ranked = [...groups.entries()].flatMap(([baseId, members]) => {
      const base = baseById.get(baseId);
      const candidates = members
        .map((row) => ({
          row,
          title: titles.get(row.id)!,
          match: matches.get(row.id)!,
        }))
        .sort(byRank);
      return base ? [{ base, candidates }] : [];
    });

    // Hiding (#359) is decided per Recipe before a group picks its card, so a hidden Variant
    // never stands for its group, nor counts in its "+N other Variants".
    const { allergies, hides } = await loadViewerAllergyContext(
      this.database,
      this.settings,
      memberId,
      familyId,
      query.showHidden,
    );
    // The warning belongs to the Recipe a card shows, which may be a Variant.
    const { warnings, hidden } = await loadAllergyWarnings(
      this.database,
      catalogScope(familyId),
      ranked.flatMap(({ candidates }) => candidates.map((c) => c.row.id)),
      locale,
      allergies,
    );
    let hiddenByAllergiesCount = 0;
    const groupsRanked = ranked
      .flatMap(({ base, candidates }) => {
        if (!hides) return [{ base, candidates }];
        const visible = candidates.filter((c) => !hidden.has(c.row.id));
        // Counted only when the override would change the card, or bring the group back.
        if (visible[0] !== candidates[0]) hiddenByAllergiesCount += 1;
        return visible.length > 0 ? [{ base, candidates: visible }] : [];
      })
      .sort((a, b) => byRank(a.candidates[0], b.candidates[0]));

    const names = await this.missingNames(
      catalogScope(familyId),
      groupsRanked,
      locale,
    );
    return {
      hiddenByAllergiesCount,
      cards: groupsRanked.map(({ base, candidates }): CookTonightCard => {
        const [top, ...others] = candidates;
        const short = top.match.lines.find(isShortOrMissing);
        return {
          base: {
            id: base.id,
            title: titles.get(base.id)!,
            archived: base.archivedAt !== null,
          },
          recipe: {
            id: top.row.id,
            title: top.title,
            parentId: top.row.parentId,
            owner: ownerOf(top.row),
            servings: top.match.servings,
            prepMinutes: top.row.prepMinutes,
            cookMinutes: top.row.cookMinutes,
            allergyWarning: warnings.get(top.row.id) ?? null,
          },
          canMake: top.match.canMake,
          missing:
            !top.match.canMake && short
              ? {
                  ingredientId: short.ingredientId,
                  name:
                    short.ingredientId !== null
                      ? names.get(short.ingredientId)!
                      : (short.name ?? ''),
                }
              : null,
          expiringCount: top.match.expiringCoveredCount,
          otherVariantsCount: others.filter((c) => c.match.canMake).length,
        };
      }),
    };
  }

  /** The Family's live copy of each Catalog Recipe in `ids`, by the Catalog Recipe's id. */
  private async liveCopyIds(
    familyId: string,
    ids: string[],
  ): Promise<Map<string, string>> {
    if (ids.length === 0) return new Map();
    const rows = await this.database
      .select({ id: recipes.id, copiedFromId: recipes.copiedFromId })
      .from(recipes)
      .where(
        and(
          eq(recipes.familyId, familyId),
          inArray(recipes.copiedFromId, [...new Set(ids)]),
          isNull(recipes.archivedAt),
        ),
      );
    return new Map(rows.map((r) => [r.copiedFromId!, r.id]));
  }

  /** Display names, in `locale`, of the Ingredients the near-miss cards are short of. */
  private async missingNames(
    scope: CatalogScope,
    cards: { candidates: Candidate[] }[],
    locale: CatalogLocale,
  ): Promise<Map<string, string>> {
    const wanted = new Set<string>();
    for (const { candidates } of cards) {
      const top = candidates[0].match;
      const line = top.canMake ? undefined : top.lines.find(isShortOrMissing);
      if (line?.ingredientId) wanted.add(line.ingredientId);
    }
    if (wanted.size === 0) return new Map();
    const ingredients = scope.ingredients(this.database);
    const rows = await this.database
      .select({ id: ingredients.id, name: ingredients.name })
      .from(ingredients)
      .where(inArray(ingredients.id, [...wanted]));
    const display = await loadDisplayNames(this.database, scope, locale, [
      ...wanted,
    ]);
    return new Map(
      rows.map((r) => [r.id, display.pick('ingredient', r.id, r.name)]),
    );
  }
}

/** A required line the Pantry cannot cover. */
const isShortOrMissing = (line: LineMatch): boolean =>
  !line.optional && line.status !== 'covered';
