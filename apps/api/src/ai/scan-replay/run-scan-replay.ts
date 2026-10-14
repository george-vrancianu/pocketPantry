// CLI entry: `npm run scan:replay -w @pocket-pantry/api -- --model gpt-6-luna --effort low --repeat 3`.
// Resends Scan debug captures through StructuredOutputAiService and writes a local report.
// See README.md next to this file.
import { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { parseArgs, parseEnv } from 'node:util';
import type { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../config/env';
import { ApiException } from '../../common/api-exception';
import {
  StructuredOutputAiError,
  StructuredOutputAiService,
} from '../structured-output-ai.service';
import {
  compareCapture,
  loadCaptures,
  renderReport,
  type ReplayRun,
} from './scan-replay';

const EFFORTS = ['none', 'minimal', 'low', 'medium', 'high', 'xhigh'] as const;
type Effort = (typeof EFFORTS)[number];

const { values } = parseArgs({
  options: {
    captures: { type: 'string', default: '.scan-debug' },
    model: { type: 'string' },
    effort: { type: 'string' },
    repeat: { type: 'string', default: '1' },
    only: { type: 'string' },
    limit: { type: 'string' },
    out: { type: 'string', default: '.scan-replay' },
  },
});

/** Same files, same order as the API's ConfigModule; the shell environment wins. */
function loadEnvFiles(): void {
  for (const file of ['.env.local', '.env', '../../.env']) {
    let parsed: Record<string, string | undefined>;
    try {
      parsed = parseEnv(readFileSync(resolve(file), 'utf8'));
    } catch {
      continue;
    }
    for (const [key, value] of Object.entries(parsed)) {
      if (process.env[key] === undefined && value !== '') {
        process.env[key] = value;
      }
    }
  }
}

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
  const model = values.model ?? process.env.AI_VISION_MODEL;
  if (!model) fail('Pass --model (or set AI_VISION_MODEL).');
  const effortArg = values.effort ?? process.env.AI_REASONING_EFFORT;
  // `unset` replays without a reasoning effort, as gpt-4o-mini runs today.
  const effort =
    effortArg === undefined || effortArg === 'unset'
      ? undefined
      : (EFFORTS as readonly string[]).includes(effortArg)
        ? (effortArg as Effort)
        : fail(`--effort must be one of ${EFFORTS.join(', ')} or unset.`);
  const repeat = Number(values.repeat);
  if (!Number.isInteger(repeat) || repeat < 1) fail('--repeat must be >= 1.');
  const limit = values.limit === undefined ? undefined : Number(values.limit);

  const settings: Partial<AppConfig> = {
    // Never `development`: replays must not write new Scan debug captures.
    NODE_ENV: 'test',
    AI_PROVIDER:
      process.env.AI_PROVIDER === 'openai-compatible'
        ? 'openai-compatible'
        : 'openai',
    AI_API_KEY: process.env.AI_API_KEY,
    AI_BASE_URL: process.env.AI_BASE_URL,
    AI_VISION_MODEL: model,
    AI_REASONING_EFFORT: effort,
  };
  if (!settings.AI_API_KEY) fail('AI_API_KEY is not set.');
  const service = new StructuredOutputAiService({
    get: (key: keyof AppConfig) => settings[key],
  } as ConfigService<AppConfig, true>);

  const captureDir = resolve(values.captures);
  const loaded = await loadCaptures(captureDir, {
    only: values.only?.split(',').map((name) => name.trim()),
  });
  const captures = loaded.captures.slice(0, limit);
  console.log(
    `Replaying ${captures.length} capture(s) from ${captureDir} on ${model} (effort ${effortArg ?? 'unset'}), ${repeat} run(s) each.`,
  );

  const comparisons = [];
  const answers: Record<string, ReplayRun[]> = {};
  for (const capture of captures) {
    const runs: ReplayRun[] = [];
    for (let run = 1; run <= repeat; run++) {
      const started = Date.now();
      try {
        const result = await service.generate(capture.request);
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
        `  ${capture.name} run ${run}: ${runs[runs.length - 1].ok ? 'ok' : 'failed'}`,
      );
    }
    answers[capture.name] = runs;
    comparisons.push(compareCapture(capture, model, runs));
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outDir = join(
    resolve(values.out),
    `${stamp}-${model.replace(/[^a-z0-9._-]/gi, '_')}-${effortArg ?? 'unset'}`,
  );
  await mkdir(outDir, { recursive: true });
  const report = renderReport({
    model,
    effort: effortArg ?? 'unset',
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
