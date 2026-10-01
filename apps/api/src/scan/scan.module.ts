import { Module } from '@nestjs/common';
import { StructuredOutputAiService } from '../ai/structured-output-ai.service';
import { CatalogModule } from '../catalog/catalog.module';
import { IngredientCatalogModule } from '../ingredients/ingredient-catalog.module';
import { SettingsModule } from '../settings/settings.module';
import { PlateScanController } from './plate-scan.controller';
import { PlateScanFlowService } from './plate-scan-flow.service';
import { PlateScanService } from './plate-scan.service';
import { ProductScanService } from './product-scan.service';
import { ScanCapService } from './scan-cap.service';
import { ScanController } from './scan.controller';
import { ScanService } from './scan.service';

@Module({
  imports: [CatalogModule, IngredientCatalogModule, SettingsModule],
  controllers: [ScanController, PlateScanController],
  providers: [
    StructuredOutputAiService,
    ProductScanService,
    PlateScanService,
    PlateScanFlowService,
    ScanCapService,
    ScanService,
  ],
})
export class ScanModule {}
