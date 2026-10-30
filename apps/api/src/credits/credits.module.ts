import { Module } from '@nestjs/common';
import { PromoCodesModule } from '../promo-codes/promo-codes.module';
import { CreditsController } from './credits.controller';
import { CreditsService } from './credits.service';

@Module({
  imports: [PromoCodesModule],
  controllers: [CreditsController],
  providers: [CreditsService],
  exports: [CreditsService],
})
export class CreditsModule {}
