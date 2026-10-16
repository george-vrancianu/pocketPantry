import { randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { Logger } from '@nestjs/common';
import type { StructuredOutputRequest } from './structured-output-ai.service';

/** What one AI call did, as the debug folder records it. */
export type ScanDebugCall = {
  request: StructuredOutputRequest;
  provider: string;
  model: string;
  startedAt: Date;
  durationMs: number;
  requestId: string | null;
  httpStatus?: number;
  /** Provider body as received: parsed JSON, or text when it was not JSON. */
  body?: unknown;
  /** The answer handed back to the Scan. */
  data?: unknown;
  error?: { code: string; reason?: string; message?: string };
};

/** What one transcription of a Voice Note did, as the debug folder records it. */
export type VoiceTranscriptionDebugCall = {
  audio: Buffer;
  /** A bare container type such as `audio/webm`. */
  mimeType: string;
  model: string;
  /** The Scan Language sent to the provider. */
  language: string;
  /** The prompt hint sent to the provider, when there was one. */
  prompt?: string;
  startedAt: Date;
  durationMs: number;
  /** Shared with the transcript read's `request.json`, to tie the two folders of one Voice Note. */
  captureId?: string;
  transcript?: string;
  error?: { code: string };
};

export type ScanDebugRecorder = {
  readonly dir: string;
  record(call: ScanDebugCall): Promise<void>;
  recordTranscription(call: VoiceTranscriptionDebugCall): Promise<void>;
};

const IMAGE_DATA_URL = /^data:image\/([a-z0-9.+-]+);base64,(.*)$/is;
// Voice Notes accept the containers a browser's MediaRecorder produces.
const AUDIO_EXTENSIONS: Record<string, string> = {
  'audio/webm': 'webm',
  'audio/mp4': 'mp4',
  'audio/ogg': 'ogg',
};
// Scans only accept these; anything else is saved without trusting its type.
const EXTENSIONS: Record<string, string> = {
  jpeg: 'jpg',
  png: 'png',
  webp: 'webp',
};

/**
 * Dev-only capture of every Scan's photos and raw AI answer (and every Voice Note's recording, transcription request, transcript and transcript read), for improving
 * recognition. Receipts are personal data, so this exists only when
 * `NODE_ENV` is `development` and `SCAN_DEBUG_DIR` is set. Env validation
 * refuses the flag in production; anywhere else it is ignored here.
 */
export function createScanDebugRecorder(
  nodeEnv: string,
  dir: string | undefined,
): ScanDebugRecorder | undefined {
  if (nodeEnv !== 'development' || !dir) return undefined;
  const root = resolve(dir);
  const logger = new Logger('ScanDebug');
  logger.warn(`Scan debug capture is ON: photos and AI answers go to ${root}`);

  return {
    dir: root,
    async record(call) {
      const folder = join(root, folderName(call));
      try {
        await mkdir(folder, { recursive: true });
        const images = await Promise.all(
          (call.request.images ?? []).map((image, index) =>
            writeImage(folder, index + 1, image),
          ),
        );
        const { request } = call;
        await writeJson(folder, 'request.json', {
          schemaName: request.schemaName,
          provider: call.provider,
          model: call.model,
          maxOutputTokens: request.maxOutputTokens,
          images,
          prompt: request.prompt,
          schema: request.schema,
          captureId: request.captureId,
        });
        await writeJson(folder, 'response.json', {
          startedAt: call.startedAt.toISOString(),
          durationMs: call.durationMs,
          requestId: call.requestId,
          httpStatus: call.httpStatus,
          outcome: call.error ? 'error' : 'ok',
          error: call.error,
          data: call.data,
          body: call.body,
        });
        logger.log(`Saved ${folder}`);
      } catch (error) {
        // Debugging must never break the Scan it is watching.
        logger.warn(
          `Could not save ${folder}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },

    async recordTranscription(call) {
      const folder = join(
        root,
        folderName({ startedAt: call.startedAt, name: 'voice_transcription' }),
      );
      try {
        await mkdir(folder, { recursive: true });
        const audio = `audio.${AUDIO_EXTENSIONS[call.mimeType] ?? 'bin'}`;
        await writeFile(join(folder, audio), call.audio);
        await writeJson(folder, 'transcription.json', {
          captureId: call.captureId,
          startedAt: call.startedAt.toISOString(),
          durationMs: call.durationMs,
          model: call.model,
          language: call.language,
          prompt: call.prompt,
          mimeType: call.mimeType,
          audio,
          outcome: call.error ? 'error' : 'ok',
          error: call.error,
          transcript: call.transcript,
        });
        logger.log(`Saved ${folder}`);
      } catch (error) {
        logger.warn(
          `Could not save ${folder}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  };
}

function folderName({
  startedAt,
  request,
  name,
}: {
  startedAt: Date;
  request?: StructuredOutputRequest;
  name?: string;
}): string {
  const time = startedAt.toISOString().replace(/[:.]/g, '-');
  const label = (name ?? request?.schemaName ?? 'call').replace(
    /[^a-z0-9_-]/gi,
    '_',
  );
  return `${time}-${label}-${randomBytes(3).toString('hex')}`;
}

/** Writes a data-URL photo as a file; anything else is only named in request.json. */
async function writeImage(
  folder: string,
  index: number,
  image: string,
): Promise<string> {
  const match = IMAGE_DATA_URL.exec(image);
  if (!match) return image.slice(0, 200);
  const type = match[1].toLowerCase();
  const name = `image-${index}.${EXTENSIONS[type] ?? 'bin'}`;
  await writeFile(join(folder, name), Buffer.from(match[2], 'base64'));
  return name;
}

async function writeJson(folder: string, name: string, value: unknown) {
  await writeFile(join(folder, name), `${JSON.stringify(value, null, 2)}\n`);
}
