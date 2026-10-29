import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catalogScope } from '../catalog/catalog-scope';
import { CatalogSearchService } from '../catalog/catalog-search.service';
import type { CatalogLocale } from '../catalog/catalog.schemas';
import { ApiException } from '../common/api-exception';
import type { AppConfig } from '../config/env';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { loadAllowedTags } from '../tags/allowed-tags';
import { SettingsService } from '../settings/settings.service';
import { plateLine } from './plate-lines';
import { signPlateToken, verifyPlateToken } from './plate-token';
import { PlateScanService } from './plate-scan.service';
import { PlateTokenUses } from './plate-token-uses';
import type {
  PlateDishesResponse,
  PlateDishInput,
  PlateScanInput,
} from './plate-scan.schemas';
import type { ScanResponse } from './proposed-line';
import { found, PaidReadsService } from './paid-reads.service';

/**
 * Plate Scan for a Member. The photo is the Scan the Scan Cap counts (handed
 * back if the provider fails); loading the picked dish's Ingredients is the
 * second half of the same Scan and is not counted again, but needs the token
 * the photo step signed, so it cannot be called for an arbitrary title, and
 * each token loads one picked dish, once (handed back if the provider fails).
 */
@Injectable()
export class PlateScanFlowService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly paidReads: PaidReadsService,
    private readonly plate: PlateScanService,
    private readonly catalogSearch: CatalogSearchService,
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

  async dishLines(
    memberId: string,
    input: PlateDishInput,
    locale: CatalogLocale,
  ): Promise<ScanResponse> {
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
    const familyId = await this.settings.familyIdOf(memberId);
    let items: Awaited<
      ReturnType<PlateScanService['findIngredients']>
    >['items'];
    let tagIds: string[];
    try {
      // The Catalog Tags and this Family's own are the only Tags the read may propose.
      const allowedTags = await loadAllowedTags(
        this.database,
        familyId,
        locale,
      );
      // The picked dish is part of the Plate Scan the photo step already paid for: recorded, not charged.
      ({ items, tagIds } = await this.paidReads.unchargedContext(
        memberId,
        'scan',
        () =>
          this.plate.findIngredients(
            input.dishTitle,
            locale,
            familyId,
            allowedTags,
          ),
      ));
    } catch (error) {
      this.uses.release(signature);
      throw error;
    }
    const ids = [
      ...new Set(
        items.flatMap((item) =>
          item.matchedIngredientId ? [item.matchedIngredientId] : [],
        ),
      ),
    ];
    const matches = new Map(
      (
        await this.catalogSearch.findByIds(
          catalogScope(familyId),
          ids,
          locale,
          await this.settings.expiryOverridesForMember(memberId),
        )
      ).map((match) => [match.id, match]),
    );
    const threshold = this.config.get('SCAN_MATCH_CONFIDENCE_THRESHOLD', {
      infer: true,
    });
    return {
      lines: items.map((item) =>
        plateLine(
          item,
          item.matchedIngredientId
            ? (matches.get(item.matchedIngredientId) ?? null)
            : null,
          threshold,
        ),
      ),
      tagIds,
    };
  }
}
