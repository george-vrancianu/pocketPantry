import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../config/env';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { AUTH } from './auth.constants';
import { AdminRoleGuard } from './admin-role.guard';
import { AuthGuard } from './auth.guard';
import { PromoCodeRateLimiter } from '../promo-codes/promo-code-rate-limiter';
import { PromoCodesModule } from '../promo-codes/promo-codes.module';
import { SignupConfigController } from './signup-config.controller';
import { createAuth } from './create-auth';

@Global()
@Module({
  imports: [PromoCodesModule],
  controllers: [SignupConfigController],
  providers: [
    {
      provide: AUTH,
      inject: [DATABASE, ConfigService, PromoCodeRateLimiter],
      useFactory: (
        database: Database,
        config: ConfigService<AppConfig, true>,
        promoLimiter: PromoCodeRateLimiter,
      ) =>
        createAuth(database, {
          baseURL: config.get('BETTER_AUTH_URL', { infer: true }),
          secret: config.get('BETTER_AUTH_SECRET', { infer: true }),
          clientOrigin: config.get('CLIENT_ORIGIN', { infer: true }),
          signup: {
            requiresPromoCode: config.get('SIGNUP_REQUIRES_PROMO_CODE', {
              infer: true,
            }),
            reserveIp: (ip) => promoLimiter.reserveIp(ip),
          },
        }),
    },
    AuthGuard,
    AdminRoleGuard,
  ],
  exports: [AUTH, AuthGuard, AdminRoleGuard],
})
export class AuthModule {}
