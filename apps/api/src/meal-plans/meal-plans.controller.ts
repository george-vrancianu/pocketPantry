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
  createMealPlanBody,
  mealPlanIdParam,
  mealPlanQuery,
  setSlotBody,
  slotParams,
  updateMealPlanBody,
  type CreateMealPlanBody,
  type MealPlanQuery,
  type MealPlanSummary,
  type MealPlanView,
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

  @Get(':id')
  @ApiOperation({ summary: 'A Meal Plan with its filled Plan Slots' })
  get(
    @CurrentUser() member: CurrentUserValue,
    @Query(query) { locale }: MealPlanQuery,
    @Param(idParam) { id }: { id: string },
  ): Promise<MealPlanView> {
    return this.plans.get(member.id, id, locale);
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
}
