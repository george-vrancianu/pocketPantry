import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminRoleGuard } from '../auth/admin-role.guard';
import { AuthGuard } from '../auth/auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AdminCatalogService } from './admin-catalog.service';
import {
  idParam,
  ingredientCreate,
  ingredientUpdate,
  leafCategoryCreate,
  leafCategoryUpdate,
  parentCategoryCreate,
  parentCategoryUpdate,
  translationCreate,
  translationUpdate,
  type IngredientCreate,
  type IngredientUpdate,
  type LeafCategoryCreate,
  type LeafCategoryUpdate,
  type ParentCategoryCreate,
  type ParentCategoryUpdate,
  type TranslationCreate,
  type TranslationUpdate,
} from './admin-catalog.schemas';

const Id = () => Param(new ZodValidationPipe(idParam));
type IdParam = { id: string };

@ApiTags('admin')
@Controller('admin/catalog')
@UseGuards(AuthGuard, AdminRoleGuard)
export class AdminCatalogController {
  constructor(private readonly catalog: AdminCatalogService) {}

  @Get()
  @ApiOperation({ summary: 'Admin only: the whole Catalog with translations' })
  overview() {
    return this.catalog.overview();
  }

  @Post('parent-categories')
  @ApiOperation({ summary: 'Admin only: create a Parent Category' })
  createParent(
    @Body(new ZodValidationPipe(parentCategoryCreate))
    body: ParentCategoryCreate,
  ) {
    return this.catalog.createParentCategory(body);
  }

  @Patch('parent-categories/:id')
  updateParent(
    @Id() { id }: IdParam,
    @Body(new ZodValidationPipe(parentCategoryUpdate))
    body: ParentCategoryUpdate,
  ) {
    return this.catalog.updateParentCategory(id, body);
  }

  @Delete('parent-categories/:id')
  @HttpCode(204)
  async deleteParent(@Id() { id }: IdParam) {
    await this.catalog.deleteParentCategory(id);
  }

  @Post('leaf-categories')
  @ApiOperation({ summary: 'Admin only: create a Leaf Category' })
  createLeaf(
    @Body(new ZodValidationPipe(leafCategoryCreate)) body: LeafCategoryCreate,
  ) {
    return this.catalog.createLeafCategory(body);
  }

  @Patch('leaf-categories/:id')
  updateLeaf(
    @Id() { id }: IdParam,
    @Body(new ZodValidationPipe(leafCategoryUpdate)) body: LeafCategoryUpdate,
  ) {
    return this.catalog.updateLeafCategory(id, body);
  }

  @Delete('leaf-categories/:id')
  @HttpCode(204)
  async deleteLeaf(@Id() { id }: IdParam) {
    await this.catalog.deleteLeafCategory(id);
  }

  @Post('ingredients')
  @ApiOperation({ summary: 'Admin only: create an Ingredient' })
  createIngredient(
    @Body(new ZodValidationPipe(ingredientCreate)) body: IngredientCreate,
  ) {
    return this.catalog.createIngredient(body);
  }

  @Patch('ingredients/:id')
  updateIngredient(
    @Id() { id }: IdParam,
    @Body(new ZodValidationPipe(ingredientUpdate)) body: IngredientUpdate,
  ) {
    return this.catalog.updateIngredient(id, body);
  }

  @Delete('ingredients/:id')
  @ApiOperation({
    summary:
      'Admin only: delete an Ingredient unless Batches or Shopping Items use it',
  })
  @HttpCode(204)
  async deleteIngredient(@Id() { id }: IdParam) {
    await this.catalog.deleteIngredient(id);
  }

  @Post('translations')
  @ApiOperation({ summary: 'Admin only: add a translated name or Synonym' })
  createTranslation(
    @Body(new ZodValidationPipe(translationCreate)) body: TranslationCreate,
  ) {
    return this.catalog.createTranslation(body);
  }

  @Patch('translations/:id')
  updateTranslation(
    @Id() { id }: IdParam,
    @Body(new ZodValidationPipe(translationUpdate)) body: TranslationUpdate,
  ) {
    return this.catalog.updateTranslation(id, body);
  }

  @Delete('translations/:id')
  @HttpCode(204)
  async deleteTranslation(@Id() { id }: IdParam) {
    await this.catalog.deleteTranslation(id);
  }
}
