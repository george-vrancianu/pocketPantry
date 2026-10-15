import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminRoleGuard } from '../auth/admin-role.guard';
import { AuthGuard } from '../auth/auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  familyIngredientsListQuery,
  mergeBody,
  promoteBody,
  type MergeBody,
  type MergedFamilyIngredients,
  type FamilyIngredientsListQuery,
  type FamilyIngredientsPage,
  type PromoteBody,
  type PromotedIngredient,
} from './family-ingredients.schemas';
import { FamilyIngredientsAdminService } from './family-ingredients.service';

@ApiTags('admin')
@Controller('admin/family-ingredients')
@UseGuards(AuthGuard, AdminRoleGuard)
export class FamilyIngredientsAdminController {
  constructor(private readonly service: FamilyIngredientsAdminService) {}

  @Get()
  @ApiOperation({
    summary:
      'Admin only: Family Ingredients grouped by normalised name across Families, most owned first',
  })
  list(
    @Query(new ZodValidationPipe(familyIngredientsListQuery))
    query: FamilyIngredientsListQuery,
  ): Promise<FamilyIngredientsPage> {
    return this.service.list(query);
  }

  @Post('promote')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Admin only: make one Family Ingredient shared (same ID) and merge the other Families copies of the name into it',
  })
  promote(
    @Body(new ZodValidationPipe(promoteBody)) body: PromoteBody,
  ): Promise<PromotedIngredient> {
    return this.service.promote(body.ingredientId);
  }

  @Post('merge')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Admin only: merge every Family copy of a name into a shared Ingredient; each Family keeps the name as a Family Synonym',
  })
  merge(
    @Body(new ZodValidationPipe(mergeBody)) body: MergeBody,
  ): Promise<MergedFamilyIngredients> {
    return this.service.merge(body.ingredientId, body.targetIngredientId);
  }
}
