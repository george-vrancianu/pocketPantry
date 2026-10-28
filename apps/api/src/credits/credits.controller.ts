import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import type { CurrentUser as CurrentUserValue } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CreditsView } from './credits.schemas';
import { CreditsService } from './credits.service';

@ApiTags('credits')
@Controller('credits')
@UseGuards(AuthGuard)
export class CreditsController {
  constructor(private readonly credits: CreditsService) {}

  @Get()
  @ApiOperation({
    summary: "The Family's Credit Balance and the Credit Price of each read",
  })
  async view(@CurrentUser() member: CurrentUserValue): Promise<CreditsView> {
    return {
      balance: await this.credits.balanceOfMember(member.id),
      prices: this.credits.prices(),
    };
  }
}
