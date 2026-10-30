import { Module } from '@nestjs/common';
import { PromoCodeRateLimiter } from './promo-code-rate-limiter';
import { PromoCodeService } from './promo-code.service';
import { PromoCodesAdminController } from './promo-codes-admin.controller';

@Module({
  controllers: [PromoCodesAdminController],
  providers: [PromoCodeService, PromoCodeRateLimiter],
  exports: [PromoCodeService, PromoCodeRateLimiter],
})
export class PromoCodesModule {}
