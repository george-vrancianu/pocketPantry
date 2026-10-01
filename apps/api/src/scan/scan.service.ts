import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CatalogSearchService } from '../catalog/catalog-search.service';
import type { CatalogLocale } from '../catalog/catalog.schemas';
import type { AppConfig } from '../config/env';
import { SettingsService } from '../settings/settings.service';
import type { ProductScanInput } from './product-scan.schemas';
import { ingredientsLine } from './ingredients-line';
import type { IngredientsScanInput } from './ingredients-scan.schemas';
import { IngredientsScanService } from './ingredients-scan.service';
import { ProductScanService } from './product-scan.service';
import { productLine, type ScanResponse } from './proposed-line';
import { ScanCapService } from './scan-cap.service';

/**
 * Runs a Scan for a Member: the Scan Cap first, then the provider, then the
 * result as proposed lines for the Review screen. Each Scan Mode adds a method
 * here that returns the same `ScanResponse`.
 */
@Injectable()
export class ScanService {
  constructor(
    private readonly cap: ScanCapService,
    private readonly productScan: ProductScanService,
    private readonly ingredientsScan: IngredientsScanService,
    private readonly catalogSearch: CatalogSearchService,
    private readonly settings: SettingsService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  async scanProduct(
    memberId: string,
    input: ProductScanInput,
    locale: CatalogLocale,
  ): Promise<ScanResponse> {
    const result = await this.withinCap(memberId, () =>
      this.productScan.analyze(input, locale),
    );
    // The Family's Default Expiry overrides shape the proposed expiry, as in search.
    const [match] = result.matchedIngredientId
      ? await this.catalogSearch.findByIds(
          [result.matchedIngredientId],
          locale,
          await this.settings.expiryOverridesForMember(memberId),
        )
      : [];
    const threshold = this.config.get('SCAN_MATCH_CONFIDENCE_THRESHOLD', {
      infer: true,
    });
    return { lines: [productLine(result, match ?? null, threshold)] };
  }

  async scanIngredients(
    memberId: string,
    input: IngredientsScanInput,
    locale: CatalogLocale,
  ): Promise<ScanResponse> {
    const result = await this.withinCap(memberId, () =>
      this.ingredientsScan.analyze(input, locale),
    );
    const ids = [
      ...new Set(
        result.items.flatMap((item) =>
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
      lines: result.items.map((item) =>
        ingredientsLine(
          item,
          (item.matchedIngredientId && matches.get(item.matchedIngredientId)) ||
            null,
          threshold,
        ),
      ),
    };
  }

  /** Counts the Scan before calling the provider, and hands it back if the provider fails. */
  private async withinCap<T>(
    memberId: string,
    run: () => Promise<T>,
  ): Promise<T> {
    const day = await this.cap.consume(memberId);
    try {
      return await run();
    } catch (error) {
      await this.cap.refund(memberId, day);
      throw error;
    }
  }
}
