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
import { MemberLanguageService } from '../member-language/member-language.service';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  shoppingLocaleQuery,
  type ShoppingLocaleQuery,
} from './shopping.schemas';
import {
  addStapleBody,
  stapleIdParam,
  updateStapleBody,
  type AddStapleBody,
  type StapleView,
  type UpdateStapleBody,
} from './staples.schemas';
import { StaplesService } from './staples.service';

const localeQuery = new ZodValidationPipe(shoppingLocaleQuery);
const idParam = new ZodValidationPipe(stapleIdParam);

/** The Family's Staples; any Member may edit them. */
@ApiTags('staples')
@UseGuards(AuthGuard)
@Controller('staples')
export class StaplesController {
  constructor(
    private readonly staples: StaplesService,
    private readonly languages: MemberLanguageService,
  ) {}

  @Get()
  @ApiOperation({ summary: "List the Family's Staples in shop order" })
  async list(
    @CurrentUser() member: CurrentUserValue,
    @Query(localeQuery) { locale }: ShoppingLocaleQuery,
  ): Promise<{ staples: StapleView[] }> {
    return {
      staples: await this.staples.list(
        member.id,
        await this.languages.catalogLanguageOf(member.id, locale),
      ),
    };
  }

  @Post()
  @ApiOperation({ summary: 'Mark a Catalog Ingredient as a Staple' })
  async add(
    @CurrentUser() member: CurrentUserValue,
    @Query(localeQuery) { locale }: ShoppingLocaleQuery,
    @Body(new ZodValidationPipe(addStapleBody)) body: AddStapleBody,
  ): Promise<StapleView> {
    return this.staples.add(
      member.id,
      body,
      await this.languages.catalogLanguageOf(member.id, locale),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: "Change a Staple's preferred quantity and unit" })
  async update(
    @CurrentUser() member: CurrentUserValue,
    @Param(idParam) { id }: { id: string },
    @Query(localeQuery) { locale }: ShoppingLocaleQuery,
    @Body(new ZodValidationPipe(updateStapleBody)) body: UpdateStapleBody,
  ): Promise<StapleView> {
    return this.staples.update(
      member.id,
      id,
      body,
      await this.languages.catalogLanguageOf(member.id, locale),
    );
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove a Staple' })
  async remove(
    @CurrentUser() member: CurrentUserValue,
    @Param(idParam) { id }: { id: string },
  ): Promise<void> {
    await this.staples.remove(member.id, id);
  }
}
