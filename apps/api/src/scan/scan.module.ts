import { Module } from '@nestjs/common';
import { StructuredOutputAiService } from '../ai/structured-output-ai.service';
import { CatalogModule } from '../catalog/catalog.module';
import { IngredientCatalogModule } from '../ingredients/ingredient-catalog.module';
import { PantryModule } from '../pantry/pantry.module';
import { SettingsModule } from '../settings/settings.module';
import { ShoppingModule } from '../shopping/shopping.module';
import { ProductScanService } from './product-scan.service';
import { ReceiptConfirmService } from './receipt-confirm.service';
import { ReceiptProposalService } from './receipt-proposal.service';
import { ReceiptScanController } from './receipt-scan.controller';
import { ReceiptScanService } from './receipt-scan.service';
import { ScanCapService } from './scan-cap.service';
import { ScanController } from './scan.controller';
import { ScanService } from './scan.service';

@Module({
  imports: [
    CatalogModule,
    IngredientCatalogModule,
    SettingsModule,
    PantryModule,
    ShoppingModule,
  ],
  controllers: [ScanController, ReceiptScanController],
  providers: [
    StructuredOutputAiService,
    ProductScanService,
    ReceiptScanService,
    ReceiptProposalService,
    ReceiptConfirmService,
    ScanCapService,
    ScanService,
  ],
})
export class ScanModule {}
