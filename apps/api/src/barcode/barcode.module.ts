import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { SettingsModule } from '../settings/settings.module';
import { BarcodeController } from './barcode.controller';
import { BarcodeLookupService } from './barcode-lookup.service';
import { OpenFoodFactsThrottle } from './open-food-facts-throttle';
import { openFoodFactsClientProvider } from './open-food-facts.client';

@Module({
  imports: [CatalogModule, SettingsModule],
  controllers: [BarcodeController],
  providers: [
    BarcodeLookupService,
    OpenFoodFactsThrottle,
    openFoodFactsClientProvider,
  ],
})
export class BarcodeModule {}
