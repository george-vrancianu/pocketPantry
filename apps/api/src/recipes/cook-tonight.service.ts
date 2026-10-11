import { Inject, Injectable } from '@nestjs/common';
import { and, inArray, isNull } from 'drizzle-orm';
import { loadDisplayNames } from '../catalog/display-names';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { ingredients, recipes } from '../database/schema';
import { SettingsService } from '../settings/settings.service';
import { utcToday } from '../shopping/batch-presence';
import { compareRecipeMatches, type LineMatch } from './matching/pantry-match';
import {
  PantryMatchingService,
  type PantryRecipeMatch,
} from './matching/pantry-matching.service';
import { recipeTitles, visibleTo } from './recipe-view';
import type {
  CookTonightCard,
  CookTonightQuery,
  CookTonightView,
  RecipeOwner,
} from './recipes.schemas';

type RecipeRow = typeof recipes.$inferSelect;
type Candidate = { row: RecipeRow; title: string; match: PantryRecipeMatch };

const ownerOf = (row: RecipeRow): RecipeOwner =>
  row.familyId === null ? 'catalog' : 'family';

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
  ): Promise<CookTonightView> {
    const familyId = await this.settings.familyIdOf(memberId);
    const rows = await this.database
      .select()
      .from(recipes)
      .where(and(visibleTo(familyId), isNull(recipes.archivedAt)));
    const matches = await this.matching.matchRecipes(
      familyId,
      rows.map((r) => r.id),
      { today: query.today ?? utcToday() },
    );

    const qualifying = rows.filter((row) => {
      const match = matches.get(row.id);
      return match && (match.canMake || match.shortOrMissingCount === 1);
    });
    if (qualifying.length === 0) return { cards: [] };

    const groups = new Map<string, RecipeRow[]>();
    for (const row of qualifying) {
      const key = row.parentId ?? row.id;
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
      query.locale,
    );
    const ranked = (members: RecipeRow[]): Candidate[] =>
      members
        .map((row) => ({
          row,
          title: titles.get(row.id)!,
          match: matches.get(row.id)!,
        }))
        .sort(
          (a, b) =>
            compareRecipeMatches(a.match, b.match) ||
            a.title.localeCompare(b.title, query.locale) ||
            a.row.id.localeCompare(b.row.id),
        );

    const best = [...groups.entries()].flatMap(([baseId, members]) => {
      const base = baseById.get(baseId);
      return base ? [{ base, candidates: ranked(members) }] : [];
    });
    best.sort(
      (a, b) =>
        compareRecipeMatches(a.candidates[0].match, b.candidates[0].match) ||
        a.candidates[0].title.localeCompare(
          b.candidates[0].title,
          query.locale,
        ) ||
        a.candidates[0].row.id.localeCompare(b.candidates[0].row.id),
    );

    const names = await this.missingNames(best, query.locale);
    return {
      cards: best.map(({ base, candidates }): CookTonightCard => {
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

  /** Display names, in `locale`, of the Ingredients the near-miss cards are short of. */
  private async missingNames(
    cards: { candidates: Candidate[] }[],
    locale: CookTonightQuery['locale'],
  ): Promise<Map<string, string>> {
    const wanted = new Set<string>();
    for (const { candidates } of cards) {
      const top = candidates[0].match;
      const line = top.canMake ? undefined : top.lines.find(isShortOrMissing);
      if (line?.ingredientId) wanted.add(line.ingredientId);
    }
    if (wanted.size === 0) return new Map();
    const rows = await this.database
      .select({ id: ingredients.id, name: ingredients.name })
      .from(ingredients)
      .where(inArray(ingredients.id, [...wanted]));
    const display = await loadDisplayNames(this.database, locale, [...wanted]);
    return new Map(
      rows.map((r) => [r.id, display.pick('ingredient', r.id, r.name)]),
    );
  }
}

/** A required line the Pantry cannot cover. */
const isShortOrMissing = (line: LineMatch): boolean =>
  !line.optional && !line.pantryBasic && line.status !== 'covered';
