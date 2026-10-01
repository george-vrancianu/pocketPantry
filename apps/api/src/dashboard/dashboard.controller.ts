import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import type { CurrentUser as CurrentUserValue } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  dashboardLayoutBody,
  type DashboardLayoutBody,
} from './dashboard.schemas';
import { DashboardService } from './dashboard.service';

/** The signed-in Member's own Dashboard layout (a Member Preference, never shared in the Family). */
@ApiTags('dashboard')
@UseGuards(AuthGuard)
@Controller('dashboard-layout')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get()
  @ApiOperation({
    summary: "The Member's Dashboard layout, or the default for a new Member",
  })
  get(@CurrentUser() member: CurrentUserValue): Promise<DashboardLayoutBody> {
    return this.dashboard.get(member.id);
  }

  @Put()
  @ApiOperation({ summary: "Replace the Member's Dashboard layout" })
  replace(
    @CurrentUser() member: CurrentUserValue,
    @Body(new ZodValidationPipe(dashboardLayoutBody)) body: DashboardLayoutBody,
  ): Promise<DashboardLayoutBody> {
    return this.dashboard.replace(member.id, body);
  }
}
