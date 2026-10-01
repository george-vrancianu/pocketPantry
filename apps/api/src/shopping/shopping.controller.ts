import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import type { CurrentUser as CurrentUserValue } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  addShoppingItemBody,
  itemIdParam,
  setCheckedBody,
  shoppingLocaleQuery,
  type AddShoppingItemBody,
  type SetCheckedBody,
  type ShoppingListView,
  type ShoppingLocaleQuery,
} from './shopping.schemas';
import { ShoppingService } from './shopping.service';

const localeQuery = new ZodValidationPipe(shoppingLocaleQuery);
const idParam = new ZodValidationPipe(itemIdParam);

/** Every route works on the signed-in Member's Family list; names come back in `locale`. */
@ApiTags('shopping-list')
@UseGuards(AuthGuard)
@Controller('shopping-list')
export class ShoppingController {
  constructor(private readonly shopping: ShoppingService) {}

  @Get()
  @ApiOperation({
    summary: "Return the Family's active Shopping List, creating it on demand",
  })
  get(
    @CurrentUser() member: CurrentUserValue,
    @Query(localeQuery) { locale }: ShoppingLocaleQuery,
  ): Promise<ShoppingListView> {
    return this.shopping.getList(member.id, locale);
  }

  @Post('items')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Add a Shopping Item, merging into an existing line for the same Ingredient and unit',
  })
  add(
    @CurrentUser() member: CurrentUserValue,
    @Query(localeQuery) { locale }: ShoppingLocaleQuery,
    @Body(new ZodValidationPipe(addShoppingItemBody)) body: AddShoppingItemBody,
  ): Promise<ShoppingListView> {
    return this.shopping.addItem(member.id, body, locale);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Check or uncheck a Shopping Item' })
  setChecked(
    @CurrentUser() member: CurrentUserValue,
    @Query(localeQuery) { locale }: ShoppingLocaleQuery,
    @Param(idParam) { id }: { id: string },
    @Body(new ZodValidationPipe(setCheckedBody)) body: SetCheckedBody,
  ): Promise<ShoppingListView> {
    return this.shopping.setChecked(member.id, id, body.checked, locale);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove a Shopping Item' })
  remove(
    @CurrentUser() member: CurrentUserValue,
    @Query(localeQuery) { locale }: ShoppingLocaleQuery,
    @Param(idParam) { id }: { id: string },
  ): Promise<ShoppingListView> {
    return this.shopping.removeItem(member.id, id, locale);
  }
}
