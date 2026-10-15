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
import { AuthGuard } from '../auth/auth.guard';
import type { CurrentUser as CurrentUserValue } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  addMissingBody,
  createMealPlanBody,
  fillBody,
  mealPlanIdParam,
  mealPlanQuery,
  setSlotBody,
  slotParams,
  updateMealPlanBody,
  type AddedMissingView,
  type AddMissingBody,
  type CreateMealPlanBody,
  type FillBody,
  type MealPlanQuery,
  type MealPlanSummary,
  type MealPlanView,
  type MealWindowView,
  type SetSlotBody,
  type SlotParams,
  type UpdateMealPlanBody,
} from './meal-plans.schemas';
import { MealPlansService } from './meal-plans.service';

const query = new ZodValidationPipe(mealPlanQuery);
const idParam = new ZodValidationPipe(mealPlanIdParam);
const slotParam = new ZodValidationPipe(slotParams);

/** Every route works on the signed-in Member's Family Meal Plans. */
@ApiTags('meal-plans')
@UseGuards(AuthGuard)
@Controller('meal-plans')
export class MealPlansController {
  constructor(private readonly plans: MealPlansService) {}

  @Get()
  @ApiOperation({ summary: "List the Family's Meal Plans, newest first" })
  list(
    @CurrentUser() member: CurrentUserValue,
  ): Promise<{ mealPlans: MealPlanSummary[] }> {
    return this.plans.list(member.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a Meal Plan' })
  create(
    @CurrentUser() member: CurrentUserValue,
    @Query(query) { locale, today }: MealPlanQuery,
    @Body(new ZodValidationPipe(createMealPlanBody)) body: CreateMealPlanBody,
  ): Promise<MealPlanView> {
    return this.plans.create(member.id, body, locale, today);
  }

  @Get('window')
  @ApiOperation({
    summary:
      "The Plan Forecast for the next 7 days from the client's today, across plans",
  })
  window(
    @CurrentUser() member: CurrentUserValue,
    @Query(query) { locale, today }: MealPlanQuery,
  ): Promise<MealWindowView> {
    return this.plans.window(member.id, locale, today);
  }

  @Post('add-missing')
  @ApiOperation({
    summary:
      'Add what the Plan Forecast says is missing to the Shopping List: for the window, one plan, one date or one Ingredient',
  })
  addMissing(
    @CurrentUser() member: CurrentUserValue,
    @Query(query) { locale, today }: MealPlanQuery,
    @Body(new ZodValidationPipe(addMissingBody)) body: AddMissingBody,
  ): Promise<AddedMissingView> {
    return this.plans.addMissing(member.id, body, locale, today);
  }

  @Get(':id')
  @ApiOperation({ summary: 'A Meal Plan with its filled Plan Slots' })
  get(
    @CurrentUser() member: CurrentUserValue,
    @Query(query) { locale, today }: MealPlanQuery,
    @Param(idParam) { id }: { id: string },
  ): Promise<MealPlanView> {
    return this.plans.get(member.id, id, locale, today);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Rename a Meal Plan, or change its Servings, start date or length',
  })
  update(
    @CurrentUser() member: CurrentUserValue,
    @Query(query) { locale, today }: MealPlanQuery,
    @Param(idParam) { id }: { id: string },
    @Body(new ZodValidationPipe(updateMealPlanBody)) body: UpdateMealPlanBody,
  ): Promise<MealPlanView> {
    return this.plans.update(member.id, id, body, locale, today);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a Meal Plan and its Plan Slots' })
  async remove(
    @CurrentUser() member: CurrentUserValue,
    @Param(idParam) { id }: { id: string },
  ): Promise<void> {
    await this.plans.remove(member.id, id);
  }

  @Put(':id/slots/:dayIndex/:mealtime')
  @ApiOperation({
    summary: 'Put a Recipe in a Plan Slot, replacing what was there',
  })
  setSlot(
    @CurrentUser() member: CurrentUserValue,
    @Query(query) { locale, today }: MealPlanQuery,
    @Param(slotParam) params: SlotParams,
    @Body(new ZodValidationPipe(setSlotBody)) body: SetSlotBody,
  ): Promise<MealPlanView> {
    return this.plans.setSlot(member.id, params, body, locale, today);
  }

  @Delete(':id/slots/:dayIndex/:mealtime')
  @HttpCode(204)
  @ApiOperation({ summary: 'Clear a Plan Slot' })
  async clearSlot(
    @CurrentUser() member: CurrentUserValue,
    @Query(query) { today }: MealPlanQuery,
    @Param(slotParam) params: SlotParams,
  ): Promise<void> {
    await this.plans.clearSlot(member.id, params, today);
  }

  @Post(':id/fill')
  @ApiOperation({
    summary:
      "Fill the plan's empty slots from today on with Recipes; never touches a filled slot or a past day",
  })
  fill(
    @CurrentUser() member: CurrentUserValue,
    @Query(query) { locale, today }: MealPlanQuery,
    @Param(idParam) { id }: { id: string },
    @Body(new ZodValidationPipe(fillBody)) body: FillBody,
  ): Promise<MealPlanView> {
    return this.plans.fill(member.id, id, body, locale, today);
  }
}
