import { Module } from '@nestjs/common';
import { InviteCodeRateLimiter } from './invite-code-rate-limiter';

/** Holds the one `InviteCodeRateLimiter`, so the Family module and signup share its windows. */
@Module({
  providers: [InviteCodeRateLimiter],
  exports: [InviteCodeRateLimiter],
})
export class InviteCodeLimiterModule {}
