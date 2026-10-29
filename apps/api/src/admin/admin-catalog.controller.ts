import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminRoleGuard } from '../auth/admin-role.guard';
import { AuthGuard } from '../auth/auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AdminCatalogService } from './admin-catalog.service';
import {
  aisleCreate,
  aisleOrder,
  aisleUpdate,
  eatingMomentOrder,
  idParam,
  ingredientAllergensBody,
  ingredientCreate,
  ingredientUpdate,
  leafCategoryCreate,
  listEntryCreate,
  listEntryUpdate,
  leafCategoryUpdate,
  parentCategoryCreate,
  parentCategoryUpdate,
  catalogTagCreate,
  catalogTagDeleteQuery,
  catalogTagUpdate,
  tagGroupCreate,
  tagGroupOrder,
  tagGroupUpdate,
  translationCreate,
  translationUpdate,
  type AisleCreate,
  type AisleOrder,
  type AisleUpdate,
  type EatingMomentOrder,
  type IngredientAllergensBody,
  type IngredientCreate,
  type IngredientUpdate,
  type LeafCategoryCreate,
  type ListEntryCreate,
  type ListEntryUpdate,
  type LeafCategoryUpdate,
  type ParentCategoryCreate,
  type ParentCategoryUpdate,
  type CatalogTagCreate,
  type CatalogTagUpdate,
  type TagGroupCreate,
  type TagGroupOrder,
  type TagGroupUpdate,
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

  @Post('aisles')
  @ApiOperation({ summary: 'Admin only: create an Aisle, last in shop order' })
  createAisle(@Body(new ZodValidationPipe(aisleCreate)) body: AisleCreate) {
    return this.catalog.createAisle(body);
  }

  @Put('aisles/order')
  @ApiOperation({
    summary: 'Admin only: set the shop order of every Aisle at once',
  })
  reorderAisles(@Body(new ZodValidationPipe(aisleOrder)) body: AisleOrder) {
    return this.catalog.reorderAisles(body);
  }

  @Patch('aisles/:id')
  updateAisle(
    @Id() { id }: IdParam,
    @Body(new ZodValidationPipe(aisleUpdate)) body: AisleUpdate,
  ) {
    return this.catalog.updateAisle(id, body);
  }

  @Delete('aisles/:id')
  @ApiOperation({
    summary: 'Admin only: delete an Aisle unless a Parent Category uses it',
  })
  @HttpCode(204)
  async deleteAisle(@Id() { id }: IdParam) {
    await this.catalog.deleteAisle(id);
  }

  @Post('tag-groups')
  @ApiOperation({ summary: 'Admin only: create a Tag Group, last in order' })
  createTagGroup(
    @Body(new ZodValidationPipe(tagGroupCreate)) body: TagGroupCreate,
  ) {
    return this.catalog.createTagGroup(body);
  }

  @Put('tag-groups/order')
  @ApiOperation({
    summary: 'Admin only: set the order of every Tag Group at once',
  })
  reorderTagGroups(
    @Body(new ZodValidationPipe(tagGroupOrder)) body: TagGroupOrder,
  ) {
    return this.catalog.reorderTagGroups(body);
  }

  @Patch('tag-groups/:id')
  updateTagGroup(
    @Id() { id }: IdParam,
    @Body(new ZodValidationPipe(tagGroupUpdate)) body: TagGroupUpdate,
  ) {
    return this.catalog.updateTagGroup(id, body);
  }

  @Delete('tag-groups/:id')
  @ApiOperation({
    summary: 'Admin only: delete a Tag Group that has no Catalog Tags',
  })
  @HttpCode(204)
  async deleteTagGroup(@Id() { id }: IdParam) {
    await this.catalog.deleteTagGroup(id);
  }

  @Post('tags')
  @ApiOperation({
    summary:
      'Admin only: create a Catalog Tag in a Tag Group; same-named Family Tags merge into it',
  })
  createCatalogTag(
    @Body(new ZodValidationPipe(catalogTagCreate)) body: CatalogTagCreate,
  ) {
    return this.catalog.createCatalogTag(body);
  }

  @Patch('tags/:id')
  @ApiOperation({
    summary:
      'Admin only: rename or move a Catalog Tag; same-named Family Tags merge into it',
  })
  updateCatalogTag(
    @Id() { id }: IdParam,
    @Body(new ZodValidationPipe(catalogTagUpdate)) body: CatalogTagUpdate,
  ) {
    return this.catalog.updateCatalogTag(id, body);
  }

  @Delete('tags/:id')
  @ApiOperation({
    summary:
      'Admin only: delete a Catalog Tag. 409 catalog.tag_in_use with the Recipe count unless ?confirm=true',
  })
  @HttpCode(204)
  async deleteCatalogTag(
    @Id() { id }: IdParam,
    @Query(new ZodValidationPipe(catalogTagDeleteQuery))
    query: { confirm: boolean },
  ) {
    await this.catalog.deleteCatalogTag(id, query.confirm);
  }

  @Post('cuisines')
  @ApiOperation({ summary: 'Admin only: create a Cuisine for Recipes' })
  createCuisine(
    @Body(new ZodValidationPipe(listEntryCreate)) body: ListEntryCreate,
  ) {
    return this.catalog.createCuisine(body);
  }

  @Patch('cuisines/:id')
  updateCuisine(
    @Id() { id }: IdParam,
    @Body(new ZodValidationPipe(listEntryUpdate)) body: ListEntryUpdate,
  ) {
    return this.catalog.updateCuisine(id, body);
  }

  @Delete('cuisines/:id')
  @ApiOperation({
    summary: 'Admin only: delete a Cuisine unless a Recipe uses it',
  })
  @HttpCode(204)
  async deleteCuisine(@Id() { id }: IdParam) {
    await this.catalog.deleteCuisine(id);
  }

  @Post('methods')
  @ApiOperation({ summary: 'Admin only: create a Method for Recipes' })
  createMethod(
    @Body(new ZodValidationPipe(listEntryCreate)) body: ListEntryCreate,
  ) {
    return this.catalog.createMethod(body);
  }

  @Patch('methods/:id')
  updateMethod(
    @Id() { id }: IdParam,
    @Body(new ZodValidationPipe(listEntryUpdate)) body: ListEntryUpdate,
  ) {
    return this.catalog.updateMethod(id, body);
  }

  @Delete('methods/:id')
  @ApiOperation({
    summary: 'Admin only: delete a Method unless a Recipe uses it',
  })
  @HttpCode(204)
  async deleteMethod(@Id() { id }: IdParam) {
    await this.catalog.deleteMethod(id);
  }

  @Post('eating-moments')
  @ApiOperation({
    summary: 'Admin only: create an Eating Moment, last in the list',
  })
  createEatingMoment(
    @Body(new ZodValidationPipe(listEntryCreate)) body: ListEntryCreate,
  ) {
    return this.catalog.createEatingMoment(body);
  }

  @Put('eating-moments/order')
  @ApiOperation({
    summary:
      'Admin only: set the order of every Eating Moment (archived included) at once',
  })
  reorderEatingMoments(
    @Body(new ZodValidationPipe(eatingMomentOrder)) body: EatingMomentOrder,
  ) {
    return this.catalog.reorderEatingMoments(body);
  }

  @Patch('eating-moments/:id')
  @ApiOperation({ summary: 'Admin only: rename an Eating Moment' })
  updateEatingMoment(
    @Id() { id }: IdParam,
    @Body(new ZodValidationPipe(listEntryUpdate)) body: ListEntryUpdate,
  ) {
    return this.catalog.updateEatingMoment(id, body);
  }

  @Post('eating-moments/:id/archive')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Admin only: archive an Eating Moment (hidden from the picker and display, kept on Recipes)',
  })
  archiveEatingMoment(@Id() { id }: IdParam) {
    return this.catalog.setEatingMomentArchived(id, true);
  }

  @Post('eating-moments/:id/unarchive')
  @HttpCode(200)
  @ApiOperation({ summary: 'Admin only: bring an Eating Moment back' })
  unarchiveEatingMoment(@Id() { id }: IdParam) {
    return this.catalog.setEatingMomentArchived(id, false);
  }

  @Post('allergens')
  @ApiOperation({ summary: 'Admin only: create an Allergen, last in the list' })
  createAllergen(
    @Body(new ZodValidationPipe(listEntryCreate)) body: ListEntryCreate,
  ) {
    return this.catalog.createAllergen(body);
  }

  @Patch('allergens/:id')
  @ApiOperation({ summary: 'Admin only: rename an Allergen' })
  updateAllergen(
    @Id() { id }: IdParam,
    @Body(new ZodValidationPipe(listEntryUpdate)) body: ListEntryUpdate,
  ) {
    return this.catalog.updateAllergen(id, body);
  }

  @Post('allergens/:id/archive')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Admin only: retire an Allergen (hidden from the pickers, kept on tags and Allergies so Recipes still warn)',
  })
  archiveAllergen(@Id() { id }: IdParam) {
    return this.catalog.setAllergenArchived(id, true);
  }

  @Post('allergens/:id/unarchive')
  @HttpCode(200)
  @ApiOperation({ summary: 'Admin only: bring a retired Allergen back' })
  unarchiveAllergen(@Id() { id }: IdParam) {
    return this.catalog.setAllergenArchived(id, false);
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

  @Put('ingredients/:id/allergens')
  @ApiOperation({
    summary:
      'Admin only: replace the Allergens a shared Ingredient contains (empty = none) and mark it checked',
  })
  setIngredientAllergens(
    @Id() { id }: IdParam,
    @Body(new ZodValidationPipe(ingredientAllergensBody))
    body: IngredientAllergensBody,
  ) {
    return this.catalog.setIngredientAllergens(id, body);
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
