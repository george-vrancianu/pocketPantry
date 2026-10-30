import { Module } from '@nestjs/common';
import { PromoCodeService } from './promo-code.service';
import { PromoCodesAdminController } from './promo-codes-admin.controller';

@Module({
  controllers: [PromoCodesAdminController],
  providers: [PromoCodeService],
  exports: [PromoCodeService],
})
export class PromoCodesModule {}
