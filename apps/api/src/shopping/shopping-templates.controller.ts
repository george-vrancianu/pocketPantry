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
  shoppingTodayQuery,
  type ShoppingTodayQuery,
} from './shopping.schemas';
import {
  createTemplateBody,
  createTemplateFromListBody,
  templateIdParam,
  updateTemplateBody,
  type CreateTemplateBody,
  type CreateTemplateFromListBody,
  type TemplateSummaryView,
  type TemplateView,
  type UpdateTemplateBody,
} from './shopping-templates.schemas';
import { ShoppingTemplatesService } from './shopping-templates.service';

const getQuery = new ZodValidationPipe(shoppingTodayQuery);
const idParam = new ZodValidationPipe(templateIdParam);

/** Every route works on the signed-in Member's Family Templates. */
@ApiTags('shopping-templates')
@UseGuards(AuthGuard)
@Controller('shopping-templates')
export class ShoppingTemplatesController {
  constructor(
    private readonly templates: ShoppingTemplatesService,
    private readonly languages: MemberLanguageService,
  ) {}

  @Get()
  @ApiOperation({ summary: "List the Family's Shopping Templates" })
  async list(
    @CurrentUser() member: CurrentUserValue,
  ): Promise<{ templates: TemplateSummaryView[] }> {
    return this.templates.list(
      member.id,
      await this.languages.catalogLanguageOf(member.id),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create a Shopping Template from scratch' })
  async create(
    @CurrentUser() member: CurrentUserValue,
    @Body(new ZodValidationPipe(createTemplateBody)) body: CreateTemplateBody,
  ): Promise<TemplateView> {
    return this.templates.create(
      member.id,
      body,
      await this.languages.catalogLanguageOf(member.id),
    );
  }

  @Post('from-list')
  @ApiOperation({
    summary: "Save the active Shopping List's items as a Shopping Template",
  })
  async createFromList(
    @CurrentUser() member: CurrentUserValue,
    @Body(new ZodValidationPipe(createTemplateFromListBody))
    body: CreateTemplateFromListBody,
  ): Promise<TemplateView> {
    return this.templates.createFromList(
      member.id,
      body.name,
      await this.languages.catalogLanguageOf(member.id),
    );
  }

  @Get(':id')
  @ApiOperation({
    summary:
      'A Shopping Template with each line flagged if it is in the Pantry',
  })
  async get(
    @CurrentUser() member: CurrentUserValue,
    @Query(getQuery) { today }: ShoppingTodayQuery,
    @Param(idParam) { id }: { id: string },
  ): Promise<TemplateView> {
    return this.templates.get(
      member.id,
      id,
      await this.languages.catalogLanguageOf(member.id),
      today,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Rename a Shopping Template or replace its lines' })
  async update(
    @CurrentUser() member: CurrentUserValue,
    @Param(idParam) { id }: { id: string },
    @Body(new ZodValidationPipe(updateTemplateBody)) body: UpdateTemplateBody,
  ): Promise<TemplateView> {
    return this.templates.update(
      member.id,
      id,
      body,
      await this.languages.catalogLanguageOf(member.id),
    );
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a Shopping Template' })
  async remove(
    @CurrentUser() member: CurrentUserValue,
    @Param(idParam) { id }: { id: string },
  ): Promise<void> {
    await this.templates.remove(member.id, id);
  }
}
