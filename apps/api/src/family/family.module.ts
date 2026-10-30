import { Module } from '@nestjs/common';
import { FamilyController } from './family.controller';
import { FamilyService } from './family.service';
import { InviteCodeLimiterModule } from './invite-code-limiter.module';
import { InviteCodeRateLimitGuard } from './invite-code-rate-limit.guard';

@Module({
  imports: [InviteCodeLimiterModule],
  controllers: [FamilyController],
  providers: [FamilyService, InviteCodeRateLimitGuard],
})
export class FamilyModule {}
