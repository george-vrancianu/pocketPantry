import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { CreditsModule } from '../credits/credits.module';
import { IngredientCatalogModule } from '../ingredients/ingredient-catalog.module';
import { MemberLanguageModule } from '../member-language/member-language.module';
import { RecipeDraftsModule } from '../recipe-drafts/recipe-drafts.module';
import { PantryModule } from '../pantry/pantry.module';
import { UsageModule } from '../usage/usage.module';
import { SettingsModule } from '../settings/settings.module';
import { ShoppingModule } from '../shopping/shopping.module';
import { CatalogMatchService } from './catalog-matching';
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
import { PaidReadsService } from './paid-reads.service';
import { ScanCapService } from './scan-cap.service';
import { ScanController } from './scan.controller';
import { ScanService } from './scan.service';

@Module({
  imports: [
    CatalogModule,
    CreditsModule,
    UsageModule,
    IngredientCatalogModule,
    SettingsModule,
    PantryModule,
    ShoppingModule,
    MemberLanguageModule,
    RecipeDraftsModule,
  ],
  controllers: [ScanController, PlateScanController, ReceiptScanController],
  exports: [CatalogMatchService, PaidReadsService, ScanCapService],
  providers: [
    ProductScanService,
    PlateScanService,
    PlateScanFlowService,
    PlateTokenUses,
    IngredientsScanService,
    ReceiptScanService,
    CatalogMatchService,
    ReceiptProposalService,
    ReceiptConfirmService,
    ScanCapService,
    PaidReadsService,
    ScanService,
  ],
})
export class ScanModule {}
