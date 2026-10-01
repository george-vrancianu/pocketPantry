import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CatalogSearchService } from '../catalog/catalog-search.service';
import type {
  CatalogLocale,
  CatalogSearchResult,
} from '../catalog/catalog.schemas';
import type { AppConfig } from '../config/env';
import { SettingsService } from '../settings/settings.service';
import type { ProposedLine } from './proposed-line';
import {
  receiptProposedLines,
  type ResolvedMatch,
} from './receipt-proposed-lines';
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
    private readonly catalogSearch: CatalogSearchService,
    private readonly settings: SettingsService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  async propose(
    result: ReceiptScanResult,
    locale: CatalogLocale,
    memberId: string,
  ): Promise<ProposedLine[]> {
    const overrides = await this.settings.expiryOverridesForMember(memberId);
    const pantryLines = result.lines.filter((line) => line.includeInPantry);

    const ids = [
      ...new Set(
        pantryLines.flatMap((line) =>
          line.matchedIngredientId ? [line.matchedIngredientId] : [],
        ),
      ),
    ];
    const byId = new Map<string, CatalogSearchResult>(
      (await this.catalogSearch.findByIds(ids, locale, overrides)).map(
        (match) => [match.id, match],
      ),
    );

    // One query for every line the model left Unmatched. Only an exact
    // normalised name hit counts; anything looser stays Unmatched.
    const fallbackNames = [
      ...new Set(
        pantryLines.flatMap((line) =>
          !line.matchedIngredientId && line.fallbackIngredientName
            ? [line.fallbackIngredientName]
            : [],
        ),
      ),
    ];
    const exact = await this.catalogSearch.findExact(
      fallbackNames,
      locale,
      overrides,
    );

    const resolve = (line: ReceiptScanResult['lines'][number]) => {
      const named = line.matchedIngredientId
        ? byId.get(line.matchedIngredientId)
        : undefined;
      if (named)
        return { match: named, guessed: false } satisfies ResolvedMatch;
      const hit = line.fallbackIngredientName
        ? exact.get(line.fallbackIngredientName)
        : undefined;
      return hit
        ? ({ match: hit, guessed: true } satisfies ResolvedMatch)
        : null;
    };
    const threshold = this.config.get('SCAN_MATCH_CONFIDENCE_THRESHOLD', {
      infer: true,
    });
    return receiptProposedLines(result, resolve, threshold);
  }
}
