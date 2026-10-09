import { Module } from '@nestjs/common';
import { FamilyController } from './family.controller';
import { FamilyService } from './family.service';
import { InviteCodeRateLimitGuard } from './invite-code-rate-limit.guard';

@Module({
  controllers: [FamilyController],
  providers: [FamilyService, InviteCodeRateLimitGuard],
})
export class FamilyModule {}
