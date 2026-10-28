import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import type { AssistantState } from './assistant-speech';
import {
  AssistantTokenGuard,
  type AssistantRequestContext,
} from './assistant-token.guard';
import {
  assistantRequestBody,
  type AssistantRequestBody,
  type AssistantRequestResponse,
} from './assistant.schemas';
import { AssistantService } from './assistant.service';

/**
 * Status of each whole-request state. The body always carries `speech` so the
 * Shortcut can say it aloud whatever the status; "nothing understood" is a
 * normal answer (200), a failure of ours or the provider's is not.
 */
const STATE_STATUS: Record<AssistantState, number> = {
  nothingUnderstood: 200,
  capReached: 429,
  outOfCredits: 402,
  providerFailed: 502,
  notConfigured: 503,
};

const SPEECH_BODY = {
  description: '`{ outcomes: [], speech }`; the Shortcut says `speech`.',
};

/** Assistant Requests (ADR 0019): authenticated by an Assistant Token only, never a session. */
@ApiTags('assistant')
@Controller('assistant')
@UseGuards(AssistantTokenGuard)
export class AssistantController {
  constructor(private readonly assistant: AssistantService) {}

  @Post('requests')
  @HttpCode(200)
  @ApiBearerAuth('assistant-token')
  @ApiOperation({
    summary:
      'Assistant Request: read dictated text into Voice Actions and apply the safe ones (add to the Shopping List, tick off a Shopping Item already on it, flag Running low) at once, with no Review. Every other kind is refused and reported. Charged to the Assistant Cap. The text is not stored.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Applied: `{ outcomes, speech }`, one outcome per Voice Action understood. Also returned (with empty `outcomes`) when nothing was understood; that request is not charged.',
  })
  @ApiResponse({ status: 400, description: 'The body is invalid.' })
  @ApiResponse({
    status: 401,
    description:
      'No Bearer Assistant Token, or an unknown or revoked one (a session cookie does not count). No `speech`.',
  })
  @ApiResponse({
    status: 429,
    description: `The Assistant Cap is reached. ${SPEECH_BODY.description}`,
  })
  @ApiResponse({
    status: 502,
    description: `The text model failed (the request is not charged). ${SPEECH_BODY.description}`,
  })
  @ApiResponse({
    status: 503,
    description: `The text model is not configured (nothing is charged). ${SPEECH_BODY.description}`,
  })
  async request(
    @Req() request: AssistantRequestContext,
    @Res({ passthrough: true }) reply: FastifyReply,
    @Body(new ZodValidationPipe(assistantRequestBody))
    body: AssistantRequestBody,
  ): Promise<AssistantRequestResponse> {
    const { state, ...response } = await this.assistant.handle(
      request.assistantMember,
      body,
    );
    if (state) void reply.code(STATE_STATUS[state]);
    return response;
  }
}
