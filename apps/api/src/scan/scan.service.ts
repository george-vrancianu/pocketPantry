import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catalogScope } from '../catalog/catalog-scope';
import { CatalogSearchService } from '../catalog/catalog-search.service';
import type { CatalogLocale, ScanLanguage } from '../catalog/catalog.schemas';
import type { AppConfig } from '../config/env';
import { SettingsService } from '../settings/settings.service';
import type { ProductScanInput } from './product-scan.schemas';
import { ingredientsLine } from './ingredients-line';
import type { IngredientsScanInput } from './ingredients-scan.schemas';
import { IngredientsScanService } from './ingredients-scan.service';
import { ProductScanService } from './product-scan.service';
import { ReceiptProposalService } from './receipt-proposal.service';
import type { ReceiptScanInput } from './receipt-scan.schemas';
import { ReceiptScanService } from './receipt-scan.service';
import { productLine, type ScanResponse } from './proposed-line';
import { found, PaidReadsService } from './paid-reads.service';

/**
 * Runs a Scan for a Member: the Scan Cap first, then the provider, then the
 * result as proposed lines for the Review screen. Each Scan Mode adds a method
 * here that returns the same `ScanResponse`.
 */
@Injectable()
export class ScanService {
  constructor(
    private readonly paidReads: PaidReadsService,
    private readonly productScan: ProductScanService,
    private readonly receiptScan: ReceiptScanService,
    private readonly receiptProposal: ReceiptProposalService,
    private readonly ingredientsScan: IngredientsScanService,
    private readonly catalogSearch: CatalogSearchService,
    private readonly settings: SettingsService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  async scanProduct(
    memberId: string,
    input: ProductScanInput,
    locale: CatalogLocale,
    scanLanguage: ScanLanguage,
  ): Promise<ScanResponse> {
    const familyId = await this.settings.familyIdOf(memberId);
    const scope = catalogScope(familyId);
    const result = await this.paidReads.read(memberId, 'scan', async () =>
      found(
        await this.productScan.analyze(input, locale, scanLanguage, familyId),
      ),
    );
    // The Family's Default Expiry overrides shape the proposed expiry, as in search.
    const overrides = await this.settings.expiryOverridesForMember(memberId);
    const [match] = result.matchedIngredientId
      ? await this.catalogSearch.findByIds(
          scope,
          [result.matchedIngredientId],
          locale,
          overrides,
        )
      : [];
    // No model Match: the printed name may be a curated Synonym (any Scan Language).
    const exact = result.matchedIngredientId
      ? undefined
      : (
          await this.catalogSearch.findExact(
            scope,
            [result.productName],
            locale,
            overrides,
          )
        ).get(result.productName);
    const threshold = this.config.get('SCAN_MATCH_CONFIDENCE_THRESHOLD', {
      infer: true,
    });
    return {
      lines: [
        exact
          ? productLine({ ...result, matchConfidence: 1 }, exact, threshold)
          : productLine(result, match ?? null, threshold),
      ],
    };
  }

  async scanReceipt(
    memberId: string,
    input: ReceiptScanInput,
    locale: CatalogLocale,
    scanLanguage: ScanLanguage,
  ): Promise<ScanResponse> {
    const familyId = await this.settings.familyIdOf(memberId);
    const result = await this.paidReads.read(memberId, 'scan', async () =>
      found(
        await this.receiptScan.analyze(input, locale, scanLanguage, familyId),
      ),
    );
    return {
      lines: await this.receiptProposal.propose(result, locale, memberId),
    };
  }

  async scanIngredients(
    memberId: string,
    input: IngredientsScanInput,
    locale: CatalogLocale,
    scanLanguage: ScanLanguage,
  ): Promise<ScanResponse> {
    const familyId = await this.settings.familyIdOf(memberId);
    const scope = catalogScope(familyId);
    const result = await this.paidReads.read(memberId, 'scan', async () =>
      found(
        await this.ingredientsScan.analyze(
          input,
          locale,
          scanLanguage,
          familyId,
        ),
      ),
    );
    const ids = [
      ...new Set(
        result.items.flatMap((item) =>
          item.matchedIngredientId ? [item.matchedIngredientId] : [],
        ),
      ),
    ];
    const overrides = await this.settings.expiryOverridesForMember(memberId);
    const matches = new Map(
      (await this.catalogSearch.findByIds(scope, ids, locale, overrides)).map(
        (match) => [match.id, match],
      ),
    );
    // Items with no model Match: the printed name may be a curated Synonym (any Scan Language).
    const exact = await this.catalogSearch.findExact(
      scope,
      result.items.flatMap((item) =>
        item.matchedIngredientId ? [] : [item.productName],
      ),
      locale,
      overrides,
    );
    const threshold = this.config.get('SCAN_MATCH_CONFIDENCE_THRESHOLD', {
      infer: true,
    });
    return {
      lines: result.items.map((item) => {
        const named =
          item.matchedIngredientId && matches.get(item.matchedIngredientId);
        if (named) return ingredientsLine(item, named, threshold);
        const hit = item.matchedIngredientId
          ? undefined
          : exact.get(item.productName);
        return hit
          ? ingredientsLine({ ...item, matchConfidence: 1 }, hit, threshold)
          : ingredientsLine(item, null, threshold);
      }),
    };
  }
}
