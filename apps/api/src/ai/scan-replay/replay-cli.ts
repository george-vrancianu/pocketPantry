// Helpers shared by the replay CLIs (run-scan-replay.ts, run-voice-replay.ts).
import { resolve } from 'node:path';
import { ApiException } from '../../common/api-exception';
import { StructuredOutputAiError } from '../structured-output-ai.service';

/** Same files, same order as the API's ConfigModule; a file never overrides what is already set. */
export function loadEnvFiles(): void {
  for (const file of ['.env.local', '.env', '../../.env']) {
    try {
      process.loadEnvFile(resolve(process.cwd(), file));
    } catch {
      // No such file: rely on the others and the environment.
    }
  }
}

/** `KEY=` means unset, as in validateEnv. */
export const env = (key: string): string | undefined =>
  process.env[key] || undefined;

/** Error code plus what the provider did (`reason`, HTTP status), never response content. */
export function describe(error: unknown): string {
  if (error instanceof StructuredOutputAiError) {
    return `${error.code} (${error.reason})`;
  }
  if (error instanceof ApiException) {
    const status = error.params.status;
    return status === undefined
      ? error.code
      : `${error.code} (HTTP ${JSON.stringify(status)})`;
  }
  return error instanceof Error ? error.message : String(error);
}

export function fail(message: string): never {
  console.error(message);
  process.exit(1);
}
