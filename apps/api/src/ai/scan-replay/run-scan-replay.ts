// CLI entry: `npm run scan:replay -w @pocket-pantry/api -- --model gpt-6-luna --effort low --repeat 3`.
// Resends debug captures through StructuredOutputAiService and writes a local report.
// See README.md next to this file.
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import type { ConfigService } from '@nestjs/config';
import {
  REASONING_EFFORTS,
  type AppConfig,
  type ReasoningEffort,
} from '../../config/env';
import { ApiException } from '../../common/api-exception';
import {
  StructuredOutputAiError,
  StructuredOutputAiService,
} from '../structured-output-ai.service';
import {
  compareDebugCapture,
  loadDebugCaptures,
  renderReport,
  type ReplayRun,
} from './scan-replay';

const { values } = parseArgs({
  options: {
    'debug-captures': { type: 'string', default: '.scan-debug' },
    model: { type: 'string' },
    effort: { type: 'string' },
    repeat: { type: 'string', default: '1' },
    only: { type: 'string' },
    limit: { type: 'string' },
    out: { type: 'string', default: '.scan-replay' },
  },
});

/** Same files, same order as the API's ConfigModule; a file never overrides what is already set. */
function loadEnvFiles(): void {
  for (const file of ['.env.local', '.env', '../../.env']) {
    try {
      process.loadEnvFile(resolve(process.cwd(), file));
    } catch {
      // No such file: rely on the others and the environment.
    }
  }
}

/** `KEY=` means unset, as in validateEnv. */
const env = (key: string): string | undefined => process.env[key] || undefined;

/** Error code plus what the provider did (`reason`, HTTP status), never response content. */
function describe(error: unknown): string {
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

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

async function main(): Promise<void> {
  loadEnvFiles();
  const model = values.model ?? env('AI_VISION_MODEL');
  if (!model) fail('Pass --model (or set AI_VISION_MODEL).');
  // `unset` replays without a reasoning effort, as gpt-4o-mini runs today.
  const effortLabel = values.effort ?? env('AI_REASONING_EFFORT') ?? 'unset';
  const effort =
    effortLabel === 'unset'
      ? undefined
      : (REASONING_EFFORTS as readonly string[]).includes(effortLabel)
        ? (effortLabel as ReasoningEffort)
        : fail(
            `--effort must be one of ${REASONING_EFFORTS.join(', ')} or unset.`,
          );
  const repeat = Number(values.repeat);
  if (!Number.isInteger(repeat) || repeat < 1) fail('--repeat must be >= 1.');
  const limit = values.limit === undefined ? undefined : Number(values.limit);

  const settings: Partial<AppConfig> = {
    // Never `development`: replays must not write new debug captures.
    NODE_ENV: 'test',
    AI_PROVIDER:
      env('AI_PROVIDER') === 'openai-compatible'
        ? 'openai-compatible'
        : 'openai',
    AI_API_KEY: env('AI_API_KEY'),
    AI_BASE_URL: env('AI_BASE_URL'),
    AI_VISION_MODEL: model,
    AI_REASONING_EFFORT: effort,
  };
  if (!settings.AI_API_KEY) fail('AI_API_KEY is not set.');
  const service = new StructuredOutputAiService({
    get: (key: keyof AppConfig) => settings[key],
  } as ConfigService<AppConfig, true>);

  const debugCaptureDir = resolve(values['debug-captures']);
  const loaded = await loadDebugCaptures(debugCaptureDir, {
    only: values.only?.split(',').map((name) => name.trim()),
  });
  const debugCaptures = loaded.debugCaptures.slice(0, limit);
  console.log(
    `Replaying ${debugCaptures.length} debug capture(s) from ${debugCaptureDir} on ${model} (effort ${effortLabel}), ${repeat} run(s) each.`,
  );

  const comparisons = [];
  const answers: Record<string, ReplayRun[]> = {};
  for (const debugCapture of debugCaptures) {
    const runs: ReplayRun[] = [];
    for (let run = 1; run <= repeat; run++) {
      const started = Date.now();
      try {
        const result = await service.generate(debugCapture.request);
        runs.push({
          ok: true,
          data: result.data,
          usage: result.usage,
          durationMs: Date.now() - started,
        });
      } catch (error) {
        runs.push({
          ok: false,
          error: describe(error),
          durationMs: Date.now() - started,
        });
      }
      console.log(
        `  ${debugCapture.name} run ${run}: ${runs[runs.length - 1].ok ? 'ok' : 'failed'}`,
      );
    }
    answers[debugCapture.name] = runs;
    comparisons.push(compareDebugCapture(debugCapture, model, runs));
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outDir = join(
    resolve(values.out),
    `${stamp}-${model.replace(/[^a-z0-9._-]/gi, '_')}-${effortLabel}`,
  );
  await mkdir(outDir, { recursive: true });
  const report = renderReport({
    model,
    effort: effortLabel,
    repeat,
    comparisons,
    skipped: loaded.skipped,
  });
  await writeFile(join(outDir, 'report.md'), report);
  await writeFile(
    join(outDir, 'answers.json'),
    `${JSON.stringify(answers, null, 2)}\n`,
  );
  console.log(`Report: ${join(outDir, 'report.md')}`);
  console.log(report.split('\n')[2]);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
