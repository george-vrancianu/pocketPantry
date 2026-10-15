import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminRoleGuard } from '../auth/admin-role.guard';
import { AuthGuard } from '../auth/auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  familySynonymPromoteBody,
  familySynonymsListQuery,
  type FamilySynonymPromoteBody,
  type FamilySynonymsListQuery,
  type FamilySynonymsPage,
  type PromotedFamilySynonym,
} from './family-synonyms.schemas';
import { FamilySynonymsAdminService } from './family-synonyms.service';

@ApiTags('admin')
@Controller('admin/family-synonyms')
@UseGuards(AuthGuard, AdminRoleGuard)
export class FamilySynonymsAdminController {
  constructor(private readonly service: FamilySynonymsAdminService) {}

  @Get()
  @ApiOperation({
    summary:
      'Admin only: Family Synonyms grouped by normalised name and Ingredient across Families, most owned first',
  })
  list(
    @Query(new ZodValidationPipe(familySynonymsListQuery))
    query: FamilySynonymsListQuery,
  ): Promise<FamilySynonymsPage> {
    return this.service.list(query);
  }

  @Post('promote')
  @ApiOperation({
    summary:
      'Admin only: add a Family Synonym candidate as a shared Synonym and remove the Family copies',
  })
  promote(
    @Body(new ZodValidationPipe(familySynonymPromoteBody))
    body: FamilySynonymPromoteBody,
  ): Promise<PromotedFamilySynonym> {
    return this.service.promote(body);
  }
}
