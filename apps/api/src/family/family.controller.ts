import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CurrentUser as CurrentUserValue } from '../auth/auth.types';
import { FamilyService } from './family.service';

@ApiTags('family')
@UseGuards(AuthGuard)
@Controller('family')
export class FamilyController {
  constructor(private readonly families: FamilyService) {}

  @Get()
  @ApiOperation({ summary: "Return the signed-in Member's Family" })
  get(@CurrentUser() member: CurrentUserValue) {
    return this.families.getForMember(member.id);
  }

  @Post('invite-code/regenerate')
  @ApiOperation({ summary: 'Owner only: replace the Invite Code' })
  regenerate(@CurrentUser() member: CurrentUserValue) {
    return this.families.regenerateInviteCode(member.id);
  }
}
