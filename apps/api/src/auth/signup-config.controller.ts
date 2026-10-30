import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../config/env';

/** Public: the signup page reads this before anyone is signed in. */
@Controller('signup-config')
export class SignupConfigController {
  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  @Get()
  read(): { promoCodeRequired: boolean } {
    return {
      promoCodeRequired: this.config.get('SIGNUP_REQUIRES_PROMO_CODE', {
        infer: true,
      }),
    };
  }
}
