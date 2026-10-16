import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { catalogScope } from '../catalog/catalog-scope';
import { ApiException } from '../common/api-exception';
import { DATABASE } from '../database/database.constants';
import type { Database, Executor } from '../database/database.types';
import { runningLow } from '../database/schema';
import { SettingsService } from '../settings/settings.service';

/** The Family's manual "Running low" flags. Row existence means on. */
@Injectable()
export class RunningLowService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly settings: SettingsService,
  ) {}

  /** The Ingredient ids the Family has flagged, in id order. */
  async list(memberId: string): Promise<string[]> {
    const familyId = await this.settings.familyIdOf(memberId);
    const rows = await this.database
      .select({ ingredientId: runningLow.ingredientId })
      .from(runningLow)
      .where(eq(runningLow.familyId, familyId))
      .orderBy(runningLow.ingredientId);
    return rows.map((row) => row.ingredientId);
  }

  /** Idempotent: flagging an Ingredient that is already flagged succeeds. */
  async set(memberId: string, ingredientId: string): Promise<void> {
    await this.setIn(this.database, memberId, ingredientId);
  }

  /** The same, in the caller's transaction. */
  async setIn(
    executor: Executor,
    memberId: string,
    ingredientId: string,
  ): Promise<void> {
    const familyId = await this.settings.familyIdOf(memberId);
    const ingredients = catalogScope(familyId).ingredients(executor);
    const [found] = await executor
      .select({ id: ingredients.id })
      .from(ingredients)
      .where(eq(ingredients.id, ingredientId));
    if (!found) throw new ApiException(404, 'pantry.ingredient_not_found');
    await executor
      .insert(runningLow)
      .values({ familyId, ingredientId })
      .onConflictDoNothing();
  }

  /** Idempotent: clearing an Ingredient that is not flagged succeeds. */
  async clear(memberId: string, ingredientId: string): Promise<void> {
    const familyId = await this.settings.familyIdOf(memberId);
    await this.database
      .delete(runningLow)
      .where(
        and(
          eq(runningLow.familyId, familyId),
          eq(runningLow.ingredientId, ingredientId),
        ),
      );
  }
}
