import { Module } from '@nestjs/common';
import { StructuredOutputAiService } from '../ai/structured-output-ai.service';
import { CatalogModule } from '../catalog/catalog.module';
import { IngredientCatalogModule } from '../ingredients/ingredient-catalog.module';
import { PantryModule } from '../pantry/pantry.module';
import { SettingsModule } from '../settings/settings.module';
import { ShoppingModule } from '../shopping/shopping.module';
import { PlateScanController } from './plate-scan.controller';
import { PlateScanFlowService } from './plate-scan-flow.service';
import { PlateScanService } from './plate-scan.service';
import { IngredientsScanService } from './ingredients-scan.service';
import { PlateTokenUses } from './plate-token-uses';
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
  controllers: [ScanController, PlateScanController, ReceiptScanController],
  providers: [
    StructuredOutputAiService,
    ProductScanService,
    PlateScanService,
    PlateScanFlowService,
    PlateTokenUses,
    IngredientsScanService,
    ReceiptScanService,
    ReceiptProposalService,
    ReceiptConfirmService,
    ScanCapService,
    ScanService,
  ],
})
export class ScanModule {}
