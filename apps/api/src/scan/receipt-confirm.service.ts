import { Injectable } from '@nestjs/common';
import type { CatalogLocale, ScanLanguage } from '../catalog/catalog.schemas';
import type { BatchView, CreateBatchBody } from '../pantry/pantry.schemas';
import { PantryService } from '../pantry/pantry.service';
import { ShoppingService } from '../shopping/shopping.service';

export type ReceiptConfirmation = {
  batches: BatchView[];
  /** Unchecked Shopping Items on the active list that the saved Batches match; the client ticks them. */
  matchedShoppingItemIds: string[];
};

@Injectable()
export class ReceiptConfirmService {
  constructor(
    private readonly pantry: PantryService,
    private readonly shopping: ShoppingService,
  ) {}

  async confirm(
    memberId: string,
    lines: CreateBatchBody[],
    locale: CatalogLocale,
    scanLanguage: ScanLanguage,
  ): Promise<ReceiptConfirmation> {
    const batches = await this.pantry.createMany(
      memberId,
      lines,
      locale,
      scanLanguage,
    );
    const ingredientIds = batches.flatMap((batch) =>
      batch.ingredientId ? [batch.ingredientId] : [],
    );
    return {
      batches,
      matchedShoppingItemIds: await this.shopping.uncheckedItemIdsFor(
        memberId,
        ingredientIds,
      ),
    };
  }
}
