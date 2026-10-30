import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminRoleGuard } from '../auth/admin-role.guard';
import { AuthGuard } from '../auth/auth.guard';
import type { CurrentUser as CurrentUserValue } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { idParam } from '../admin/admin-catalog.schemas';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  generateBody,
  listQuery,
  type GenerateBody,
  type ListQuery,
  type PromoCodeEntry,
  type PromoCodePage,
} from './promo-code.schemas';
import { PromoCodeService } from './promo-code.service';

@ApiTags('admin')
@Controller('admin/promo-codes')
@UseGuards(AuthGuard, AdminRoleGuard)
export class PromoCodesAdminController {
  constructor(private readonly promoCodes: PromoCodeService) {}

  @Post()
  @ApiOperation({
    summary:
      'Admin only: generate 1 to 50 Promo Codes worth 0 to 10,000 Credits each, with an optional note',
  })
  async generate(
    @CurrentUser() admin: CurrentUserValue,
    @Body(new ZodValidationPipe(generateBody)) body: GenerateBody,
  ): Promise<{ codes: string[] }> {
    return { codes: await this.promoCodes.generate(admin.id, body) };
  }

  @Get()
  @ApiOperation({
    summary:
      'Admin only: Promo Codes newest first, optionally only Unused, Redeemed or Revoked, one page at a time',
  })
  list(
    @Query(new ZodValidationPipe(listQuery)) query: ListQuery,
  ): Promise<PromoCodePage> {
    return this.promoCodes.list(query);
  }

  @Post(':id/revoke')
  @HttpCode(200)
  @ApiOperation({ summary: 'Admin only: revoke an Unused Promo Code' })
  revoke(
    @Param(new ZodValidationPipe(idParam)) { id }: { id: string },
  ): Promise<PromoCodeEntry> {
    return this.promoCodes.revoke(id);
  }
}
