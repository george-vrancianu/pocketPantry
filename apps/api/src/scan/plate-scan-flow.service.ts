import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CatalogLocale } from '../catalog/catalog.schemas';
import { ApiException } from '../common/api-exception';
import type { AppConfig } from '../config/env';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { loadAllowedTags } from '../tags/allowed-tags';
import { RecipeDraftsService } from '../recipe-drafts/recipe-drafts.service';
import { SettingsService } from '../settings/settings.service';
import { draftContentOfPlate } from './plate-recipe-draft';
import { signPlateToken, verifyPlateToken } from './plate-token';
import { PlateScanService } from './plate-scan.service';
import { PlateTokenUses } from './plate-token-uses';
import type {
  PlateDishesResponse,
  PlateRecipeInput,
  PlateRecipeResponse,
  PlateScanInput,
} from './plate-scan.schemas';
import { found, PaidReadsService } from './paid-reads.service';

/**
 * Plate Scan for a Member. The photo is the Scan the Scan Cap counts (handed
 * back if the provider fails); writing the picked dish as a Recipe Draft is the
 * second half of the same Scan: not counted by the Scan Cap again, but charged its own Credit
 * Price (ADR 0035), and it needs the token
 * the photo step signed, so it cannot be called for an arbitrary title, and
 * each token writes one picked dish, once (handed back if no Recipe Draft is made).
 */
@Injectable()
export class PlateScanFlowService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly paidReads: PaidReadsService,
    private readonly plate: PlateScanService,
    private readonly drafts: RecipeDraftsService,
    private readonly settings: SettingsService,
    private readonly config: ConfigService<AppConfig, true>,
    private readonly uses: PlateTokenUses,
  ) {}

  async scanDishes(
    memberId: string,
    input: PlateScanInput,
    locale: CatalogLocale,
  ): Promise<PlateDishesResponse> {
    return this.paidReads.read(memberId, 'scan', async () => {
      const result = await this.plate.findDishes(input, locale);
      const token = signPlateToken({
        secret: this.config.get('SCAN_TOKEN_SECRET', { infer: true }),
        memberId,
        titles: result.dishes.map((dish) => dish.title),
      });
      return found({ ...result, token });
    });
  }

  /**
   * Writes the picked dish as a whole Recipe and stores it as the Member's Recipe Draft (ADR 0035),
   * the way Recipe from Link does. The token is spent only once the Recipe Draft exists.
   */
  async writeRecipe(
    memberId: string,
    input: PlateRecipeInput,
    locale: CatalogLocale,
  ): Promise<PlateRecipeResponse> {
    // Before the provider is called: the expensive call only runs for a dish this Member's Scan guessed.
    const { signature, expiresAt } = verifyPlateToken({
      secret: this.config.get('SCAN_TOKEN_SECRET', { infer: true }),
      memberId,
      dishTitle: input.dishTitle,
      token: input.plateToken,
    });
    // Claimed synchronously before any await, so concurrent calls on one token cannot both pass.
    if (!this.uses.claim(signature, expiresAt)) {
      throw new ApiException(400, 'scan.plate_token_invalid');
    }
    try {
      // Charged on its own (ADR 0035): the Credit is held before the provider is called, so a short
      // balance is refused here (and the catch below hands the token back), and given back if no Recipe Draft is made.
      return await this.paidReads.read(memberId, 'plate-recipe', async () => {
        const familyId = await this.settings.familyIdOf(memberId);
        // The Catalog Tags and this Family's own are the only Tags the read may propose.
        const allowedTags = await loadAllowedTags(
          this.database,
          familyId,
          locale,
        );
        const written = await this.plate.writeRecipe(
          input.dishTitle,
          locale,
          familyId,
          allowedTags,
        );
        const content = draftContentOfPlate(
          written.answer,
          { tagIds: written.tagIds, ingredientIds: written.ingredientIds },
          {
            ingredientNames: written.ingredientNames,
            matchThreshold: this.config.get('SCAN_MATCH_CONFIDENCE_THRESHOLD', {
              infer: true,
            }),
          },
        );
        const { id } = await this.drafts.create(memberId, {
          kind: 'new_recipe',
          baseRecipeId: null,
          content,
        });
        return found({ recipeDraftId: id });
      });
    } catch (error) {
      // No Recipe Draft exists: the Member can pick again within the attempt limit.
      this.uses.release(signature);
      throw error;
    }
  }
}
