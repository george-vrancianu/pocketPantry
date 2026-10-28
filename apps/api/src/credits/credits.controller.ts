import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import type { CurrentUser as CurrentUserValue } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { LOW_BALANCE_THRESHOLD, type CreditsView } from './credits.schemas';
import { CreditsService } from './credits.service';

@ApiTags('credits')
@Controller('credits')
@UseGuards(AuthGuard)
export class CreditsController {
  constructor(private readonly credits: CreditsService) {}

  @Get()
  @ApiOperation({
    summary:
      "The Family's Credit Balance, Credit Prices, low-balance threshold and recent history",
  })
  async view(@CurrentUser() member: CurrentUserValue): Promise<CreditsView> {
    return {
      balance: await this.credits.balanceOfMember(member.id),
      prices: this.credits.prices(),
      lowBalanceThreshold: LOW_BALANCE_THRESHOLD,
      history: await this.credits.historyOfMember(member.id),
    };
  }
}
