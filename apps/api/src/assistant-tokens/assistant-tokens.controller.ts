import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import type { CurrentUser as CurrentUserValue } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AssistantTokenService } from './assistant-token.service';
import {
  assistantTokenIdParam,
  createAssistantTokenBody,
  type AssistantTokenView,
  type CreateAssistantTokenBody,
  type CreatedAssistantToken,
} from './assistant-token.schemas';

/** Session-authenticated management of the signed-in Member's own Assistant Tokens. */
@ApiTags('assistant-tokens')
@Controller('assistant-tokens')
@UseGuards(AuthGuard)
export class AssistantTokensController {
  constructor(private readonly tokens: AssistantTokenService) {}

  @Post()
  @ApiOperation({
    summary: 'Create an Assistant Token; the raw secret is returned only once',
  })
  create(
    @CurrentUser() member: CurrentUserValue,
    @Body(new ZodValidationPipe(createAssistantTokenBody))
    body: CreateAssistantTokenBody,
  ): Promise<CreatedAssistantToken> {
    return this.tokens.create(member.id, body.name);
  }

  @Get()
  @ApiOperation({ summary: "The Member's own active Assistant Tokens" })
  list(@CurrentUser() member: CurrentUserValue): Promise<AssistantTokenView[]> {
    return this.tokens.list(member.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: "Revoke one of the Member's own Assistant Tokens" })
  async revoke(
    @CurrentUser() member: CurrentUserValue,
    @Param('id', new ZodValidationPipe(assistantTokenIdParam)) id: string,
  ): Promise<{ id: string }> {
    await this.tokens.revoke(member.id, id);
    return { id };
  }
}
