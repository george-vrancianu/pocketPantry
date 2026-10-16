import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CatalogLocale } from '../catalog/catalog.schemas';
import type { AppConfig } from '../config/env';
import { SettingsService } from '../settings/settings.service';
import { CatalogMatchService } from './catalog-matching';
import type { ProposedLine } from './proposed-line';
import { receiptProposedLines } from './receipt-proposed-lines';
import type { ReceiptScanResult } from './receipt-scan.schemas';

/**
 * Turns a validated Receipt Scan result into proposed lines. The model's ids
 * were already checked against the Catalog; here each one is loaded as a
 * localised Catalog Ingredient with the Family's Default Expiry overrides. A
 * pantry line the model left Unmatched gets one more chance: its generic name
 * must exactly equal (once normalised) an Ingredient name, display name or
 * Synonym in any locale, which is how a Romanian receipt line finds its
 * Ingredient. Anything short of an exact hit stays Unmatched.
 */
@Injectable()
export class ReceiptProposalService {
  constructor(
    private readonly catalogMatch: CatalogMatchService,
    private readonly settings: SettingsService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  async propose(
    result: ReceiptScanResult,
    locale: CatalogLocale,
    memberId: string,
  ): Promise<ProposedLine[]> {
    const scope = await this.settings.catalogScopeForMember(memberId);
    const overrides = await this.settings.expiryOverridesForMember(memberId);
    const pantryLines = result.lines.filter((line) => line.includeInPantry);

    // The printed `sourceText` is tried after the generic name: a Synonym a
    // curator made from an Unmatched raw name (in any Scan Language) is that
    // same text.
    const resolved = await this.catalogMatch.resolve(
      pantryLines.map((line) => ({
        names: [line.fallbackIngredientName, line.sourceText],
        proposedIngredientId: line.matchedIngredientId,
      })),
      scope,
      locale,
      overrides,
    );
    const byLine = new Map(pantryLines.map((line, i) => [line, resolved[i]]));
    const resolve = (line: ReceiptScanResult['lines'][number]) =>
      byLine.get(line) ?? null;
    const threshold = this.config.get('SCAN_MATCH_CONFIDENCE_THRESHOLD', {
      infer: true,
    });
    return receiptProposedLines(result, resolve, threshold);
  }
}
