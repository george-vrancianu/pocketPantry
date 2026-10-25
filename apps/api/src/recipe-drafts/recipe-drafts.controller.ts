import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import type { CurrentUser as CurrentUserValue } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { MemberLanguageService } from '../member-language/member-language.service';
import { RecipeDraftsService } from './recipe-drafts.service';
import {
  recipeDraftCreate,
  recipeDraftParam,
  recipeDraftUpdate,
  type RecipeDraftCreate,
  type RecipeDraftSummary,
  type RecipeDraftUpdate,
  type RecipeDraftView,
} from './recipe-drafts.schemas';

const Id = () => Param(new ZodValidationPipe(recipeDraftParam));

@ApiTags('recipe-drafts')
@Controller('recipe-drafts')
@UseGuards(AuthGuard)
export class RecipeDraftsController {
  constructor(
    private readonly drafts: RecipeDraftsService,
    private readonly languages: MemberLanguageService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      "The Member's own Recipe Drafts as summaries, newest edit first (expired ones are deleted first)",
  })
  async list(
    @CurrentUser() member: CurrentUserValue,
  ): Promise<RecipeDraftSummary[]> {
    const locale = await this.languages.catalogLanguageOf(member.id);
    return this.drafts.list(member.id, locale);
  }

  @Get(':id')
  @ApiOperation({
    summary:
      'One Recipe Draft with its content, version and whether its base is still available',
  })
  async get(
    @CurrentUser() member: CurrentUserValue,
    @Id() { id }: { id: string },
  ): Promise<RecipeDraftView> {
    const locale = await this.languages.catalogLanguageOf(member.id);
    return this.drafts.get(member.id, id, locale);
  }

  @Post()
  @ApiOperation({
    summary:
      'Keep a new Recipe Draft (at most 20 per Member); returns id and version 1',
  })
  create(
    @CurrentUser() member: CurrentUserValue,
    @Body(new ZodValidationPipe(recipeDraftCreate)) body: RecipeDraftCreate,
  ) {
    return this.drafts.create(member.id, body);
  }

  @Put(':id')
  @ApiOperation({
    summary:
      "Replace a Recipe Draft's content; 409 when the version is not the stored one",
  })
  update(
    @CurrentUser() member: CurrentUserValue,
    @Id() { id }: { id: string },
    @Body(new ZodValidationPipe(recipeDraftUpdate)) body: RecipeDraftUpdate,
  ) {
    return this.drafts.update(member.id, id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Discard a Recipe Draft' })
  async remove(
    @CurrentUser() member: CurrentUserValue,
    @Id() { id }: { id: string },
  ): Promise<void> {
    await this.drafts.remove(member.id, id);
  }
}
