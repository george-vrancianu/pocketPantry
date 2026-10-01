import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CatalogSearchService } from '../catalog/catalog-search.service';
import type { CatalogLocale } from '../catalog/catalog.schemas';
import type { AppConfig } from '../config/env';
import { SettingsService } from '../settings/settings.service';
import { plateLine } from './plate-lines';
import { PlateScanService } from './plate-scan.service';
import type { PlateDishes, PlateScanInput } from './plate-scan.schemas';
import type { ScanResponse } from './proposed-line';
import { ScanCapService } from './scan-cap.service';

/**
 * Plate Scan for a Member. The photo is the Scan the Scan Cap counts (handed
 * back if the provider fails); loading the picked dish's Ingredients is the
 * second half of the same Scan and is not counted again.
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
  ): Promise<PlateDishes> {
    const day = await this.cap.consume(memberId);
    try {
      return await this.plate.findDishes(input, locale);
    } catch (error) {
      await this.cap.refund(memberId, day);
      throw error;
    }
  }

  async dishLines(
    memberId: string,
    dishTitle: string,
    locale: CatalogLocale,
  ): Promise<ScanResponse> {
    const { items } = await this.plate.findIngredients(dishTitle, locale);
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
