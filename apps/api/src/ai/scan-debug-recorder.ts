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

export type ScanDebugRecorder = {
  readonly dir: string;
  record(call: ScanDebugCall): Promise<void>;
};

const IMAGE_DATA_URL = /^data:image\/([a-z0-9.+-]+);base64,(.*)$/is;
const EXTENSIONS: Record<string, string> = { jpeg: 'jpg', 'svg+xml': 'svg' };

/**
 * Dev-only capture of every Scan's photos and raw AI answer, for improving
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
  };
}

function folderName({ startedAt, request }: ScanDebugCall): string {
  const time = startedAt.toISOString().replace(/[:.]/g, '-');
  const schema = request.schemaName.replace(/[^a-z0-9_-]/gi, '_');
  return `${time}-${schema}-${randomBytes(3).toString('hex')}`;
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
  const name = `image-${index}.${EXTENSIONS[type] ?? type}`;
  await writeFile(join(folder, name), Buffer.from(match[2], 'base64'));
  return name;
}

async function writeJson(folder: string, name: string, value: unknown) {
  await writeFile(join(folder, name), `${JSON.stringify(value, null, 2)}\n`);
}
