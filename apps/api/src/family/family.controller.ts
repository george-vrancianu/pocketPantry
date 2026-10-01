import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CurrentUser as CurrentUserValue } from '../auth/auth.types';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { FamilyService } from './family.service';

const joinCode = z.object({ code: z.string().trim().min(1).max(32) });
const transferBody = z.object({ memberId: z.string().min(1).max(128) });
const memberParam = z.string().min(1).max(128);

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

  @Get('join-preview')
  @ApiOperation({
    summary:
      'What joining with this Invite Code would delete (counts); validates the code',
  })
  joinPreview(
    @CurrentUser() member: CurrentUserValue,
    @Query(new ZodValidationPipe(joinCode)) query: z.infer<typeof joinCode>,
  ) {
    return this.families.previewJoin(member.id, query.code);
  }

  @Post('join')
  @ApiOperation({
    summary: 'Join a Family by Invite Code, deleting your own Household of One',
  })
  join(
    @CurrentUser() member: CurrentUserValue,
    @Body(new ZodValidationPipe(joinCode)) body: z.infer<typeof joinCode>,
  ) {
    return this.families.join(member.id, body.code);
  }

  @Post('leave')
  @HttpCode(200)
  @ApiOperation({ summary: 'Leave the Family for a fresh Household of One' })
  leave(@CurrentUser() member: CurrentUserValue) {
    return this.families.leave(member.id);
  }

  @Post('transfer-ownership')
  @HttpCode(200)
  @ApiOperation({ summary: 'Owner only: make another Member the Owner' })
  transfer(
    @CurrentUser() member: CurrentUserValue,
    @Body(new ZodValidationPipe(transferBody))
    body: z.infer<typeof transferBody>,
  ) {
    return this.families.transferOwnership(member.id, body.memberId);
  }

  @Delete('members/:memberId')
  @ApiOperation({ summary: 'Owner only: remove a Member from the Family' })
  remove(
    @CurrentUser() member: CurrentUserValue,
    @Param('memberId', new ZodValidationPipe(memberParam)) memberId: string,
  ) {
    return this.families.removeMember(member.id, memberId);
  }

  @Delete()
  @ApiOperation({ summary: 'Owner only: delete the Family and all its data' })
  deleteFamily(@CurrentUser() member: CurrentUserValue) {
    return this.families.deleteFamily(member.id);
  }
}
