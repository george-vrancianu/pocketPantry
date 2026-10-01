import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CatalogSearchService } from '../catalog/catalog-search.service';
import type { CatalogLocale } from '../catalog/catalog.schemas';
import type { AppConfig } from '../config/env';
import { SettingsService } from '../settings/settings.service';
import { plateLine } from './plate-lines';
import { signPlateToken, verifyPlateToken } from './plate-token';
import { PlateScanService } from './plate-scan.service';
import type {
  PlateDishesResponse,
  PlateDishInput,
  PlateScanInput,
} from './plate-scan.schemas';
import type { ScanResponse } from './proposed-line';
import { ScanCapService } from './scan-cap.service';

/**
 * Plate Scan for a Member. The photo is the Scan the Scan Cap counts (handed
 * back if the provider fails); loading the picked dish's Ingredients is the
 * second half of the same Scan and is not counted again, but needs the token
 * the photo step signed, so it cannot be called for an arbitrary title.
 */
@Injectable()
export class PlateScanFlowService {
  constructor(
    private readonly cap: ScanCapService,
    private readonly plate: PlateScanService,
    private readonly catalogSearch: CatalogSearchService,
    private readonly settings: SettingsService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  async scanDishes(
    memberId: string,
    input: PlateScanInput,
    locale: CatalogLocale,
  ): Promise<PlateDishesResponse> {
    const day = await this.cap.consume(memberId);
    try {
      const result = await this.plate.findDishes(input, locale);
      const token = signPlateToken({
        secret: this.config.get('SCAN_TOKEN_SECRET', { infer: true }),
        memberId,
        titles: result.dishes.map((dish) => dish.title),
      });
      return { ...result, token };
    } catch (error) {
      await this.cap.refund(memberId, day);
      throw error;
    }
  }

  async dishLines(
    memberId: string,
    input: PlateDishInput,
    locale: CatalogLocale,
  ): Promise<ScanResponse> {
    // Before the provider is called: the expensive call only runs for a dish this Member's Scan guessed.
    verifyPlateToken({
      secret: this.config.get('SCAN_TOKEN_SECRET', { infer: true }),
      memberId,
      dishTitle: input.dishTitle,
      token: input.plateToken,
    });
    const { items } = await this.plate.findIngredients(input.dishTitle, locale);
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
    };
  }
}
