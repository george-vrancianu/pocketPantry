import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { AuthGuard } from '../auth/auth.guard';
import type { CurrentUser as CurrentUserValue } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { ApiException } from '../common/api-exception';
import {
  toValidationIssues,
  ZodValidationPipe,
} from '../common/zod-validation.pipe';
import { MemberLanguageService } from '../member-language/member-language.service';
import {
  voiceApplyBody,
  type VoiceApplyBody,
  type VoiceApplyResult,
} from './voice-actions';
import {
  supportedAudioType,
  voiceNoteFields,
  type VoiceNoteResponse,
} from './voice.schemas';
import { VoiceService } from './voice.service';

type Upload = {
  fields: Record<string, string>;
  audio?: { buffer: Buffer; mimeType: string };
};

async function readUpload(request: FastifyRequest): Promise<Upload> {
  if (!request.isMultipart()) {
    throw new ApiException(400, 'validation_failed', { issues: [] });
  }
  const upload: Upload = { fields: {} };
  try {
    for await (const part of request.parts()) {
      if (part.type === 'field') {
        if (typeof part.value === 'string')
          upload.fields[part.fieldname] = part.value;
      } else if (part.fieldname === 'audio' && !upload.audio) {
        upload.audio = {
          buffer: await part.toBuffer(),
          mimeType: part.mimetype,
        };
      } else {
        await part.toBuffer();
      }
    }
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === 'FST_REQ_FILE_TOO_LARGE') {
      throw new ApiException(413, 'voice.too_long');
    }
    throw error;
  }
  return upload;
}

@ApiTags('voice')
@Controller('voice')
@UseGuards(AuthGuard)
export class VoiceController {
  constructor(
    private readonly voice: VoiceService,
    private readonly languages: MemberLanguageService,
  ) {}

  @Get('config')
  @ApiOperation({
    summary: 'Whether Voice Notes are available (transcription is configured).',
  })
  config(): { configured: boolean } {
    return { configured: this.voice.isConfigured() };
  }

  @Post()
  @ApiOperation({
    summary:
      'Voice Note: transcribe a held-to-talk recording (multipart: audio, durationMs, spokenLanguage, defaultTarget, today). Neither the audio nor the transcript is stored.',
  })
  async note(
    @CurrentUser() member: CurrentUserValue,
    @Req() request: FastifyRequest,
  ): Promise<VoiceNoteResponse> {
    if (!this.voice.isConfigured()) {
      throw new ApiException(503, 'voice.not_configured');
    }
    const upload = await readUpload(request);
    const fields = voiceNoteFields.safeParse(upload.fields);
    if (!fields.success || !upload.audio) {
      throw new ApiException(400, 'validation_failed', {
        issues: fields.success ? [] : toValidationIssues(fields.error),
      });
    }
    const mimeType = supportedAudioType(upload.audio.mimeType);
    if (!mimeType) throw new ApiException(415, 'voice.unsupported_audio');
    // Names are made up, matched and written in the Catalog Language; the
    // prompt is only told the UI Language. Transcription is unchanged.
    const { ui, catalog } = await this.languages.languagesOf(member.id);
    // The recording is read in the Spoken Language: the upload's own choice, else the Preference.
    const spokenLanguage = await this.languages.spokenLanguageOf(
      member.id,
      fields.data.spokenLanguage,
    );
    return this.voice.read(member.id, {
      ...fields.data,
      spokenLanguage,
      locale: catalog,
      uiLanguage: ui,
      audio: upload.audio.buffer,
      mimeType,
    });
  }

  @Post('apply')
  @ApiOperation({
    summary:
      'Apply the Voice Actions as edited in Review: each is re-checked against the current lists and all are written in one transaction. Does not count against the Voice Cap.',
  })
  async apply(
    @CurrentUser() member: CurrentUserValue,
    @Body(new ZodValidationPipe(voiceApplyBody)) body: VoiceApplyBody,
  ): Promise<VoiceApplyResult> {
    // Unmatched names are written in the Catalog Language, as Review showed them.
    const locale = await this.languages.catalogLanguageOf(member.id);
    return this.voice.apply(member.id, { ...body, locale });
  }
}
