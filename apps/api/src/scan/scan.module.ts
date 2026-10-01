import { Module } from '@nestjs/common';
import { StructuredOutputAiService } from '../ai/structured-output-ai.service';
import { CatalogModule } from '../catalog/catalog.module';
import { IngredientCatalogModule } from '../ingredients/ingredient-catalog.module';
import { ProductScanService } from './product-scan.service';
import { ScanCapService } from './scan-cap.service';
import { ScanController } from './scan.controller';
import { ScanService } from './scan.service';

@Module({
  imports: [CatalogModule, IngredientCatalogModule],
  controllers: [ScanController],
  providers: [
    StructuredOutputAiService,
    ProductScanService,
    ScanCapService,
    ScanService,
  ],
})
export class ScanModule {}
