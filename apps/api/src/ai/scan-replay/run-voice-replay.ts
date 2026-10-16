// CLI entry: `npm run voice:replay -w @pocket-pantry/api -- --mode read --model gpt-5-nano --effort low`.
// Replays Voice Note cases against real providers, on a developer's machine only.
// See README.md next to this file.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import type { ConfigService } from '@nestjs/config';
import { SCAN_LANGUAGES } from '../../catalog/catalog.schemas';
import {
  DEFAULT_TEXT_MODEL,
  DEFAULT_TEXT_REASONING_EFFORT,
  REASONING_EFFORTS,
  type AppConfig,
  type ReasoningEffort,
} from '../../config/env';
import { audioTypeOfExtension } from '../../voice/voice.schemas';
import { TranscriptionService } from '../../voice/transcription.service';
import { StructuredOutputAiService } from '../structured-output-ai.service';
import { describe, env, fail, loadEnvFiles } from './replay-cli';
import type { Price, ReplayRun } from './scan-replay';
import { compareTranscripts } from './voice-cases';
import {
  evaluateReadRun,
  loadVoiceCaseSet,
  renderReadReport,
  renderTranscriptionReport,
  requestFor,
  type ReadRunResult,
  type TranscriptionRunResult,
} from './voice-replay';

const { values } = parseArgs({
  options: {
    mode: { type: 'string', default: 'read' },
    cases: { type: 'string', default: 'src/ai/scan-replay/voice-cases' },
    model: { type: 'string' },
    effort: { type: 'string' },
    price: { type: 'string' },
    repeat: { type: 'string', default: '1' },
    only: { type: 'string' },
    language: { type: 'string' },
    limit: { type: 'string' },
    out: { type: 'string', default: '.scan-replay' },
  },
});

const slug = (value: string) => value.replace(/[^a-z0-9._-]/gi, '_');

async function main(): Promise<void> {
  loadEnvFiles();
  const mode = values.mode;
  if (mode !== 'read' && mode !== 'transcribe') {
    fail('--mode must be read or transcribe.');
  }
  const repeat = Number(values.repeat);
  if (!Number.isInteger(repeat) || repeat < 1) fail('--repeat must be >= 1.');
  const language = values.language;
  if (language && !(SCAN_LANGUAGES as readonly string[]).includes(language)) {
    fail(`--language must be one of ${SCAN_LANGUAGES.join(', ')}.`);
  }
  const apiKey = env('AI_API_KEY');
  if (!apiKey) fail('AI_API_KEY is not set.');
  const provider =
    env('AI_PROVIDER') === 'openai-compatible' ? 'openai-compatible' : 'openai';

  const set = loadVoiceCaseSet(values.cases, {
    only: values.only?.split(',').map((id) => id.trim()),
    language: language as (typeof SCAN_LANGUAGES)[number] | undefined,
  });
  const limit = values.limit === undefined ? undefined : Number(values.limit);
  if (limit !== undefined && (!Number.isInteger(limit) || limit < 1)) {
    fail('--limit must be >= 1.');
  }
  const cases = set.cases.slice(0, limit);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outRoot = resolve(values.out);

  if (mode === 'transcribe') {
    const model =
      values.model ?? env('AI_TRANSCRIBE_MODEL') ?? 'gpt-transcribe';
    const settings: Partial<AppConfig> = {
      // Never `development`: replays must not write new debug captures.
      NODE_ENV: 'test',
      AI_PROVIDER: provider,
      AI_API_KEY: apiKey,
      AI_BASE_URL: env('AI_BASE_URL'),
      AI_TRANSCRIBE_MODEL: model,
    };
    const service = new TranscriptionService({
      get: (key: keyof AppConfig) => settings[key],
    } as ConfigService<AppConfig, true>);
    const withAudio = cases.filter((c) => c.audioPath);
    console.log(
      `Replaying transcription of ${withAudio.length} recording(s) (${cases.length - withAudio.length} case(s) without audio skipped) on ${model}, ${repeat} run(s) each.`,
    );
    const results: TranscriptionRunResult[] = [];
    for (const c of withAudio) {
      const mimeType = audioTypeOfExtension(extname(c.audioPath!));
      if (!mimeType) {
        results.push({
          caseId: c.id,
          scanLanguage: c.scanLanguage,
          ok: false,
          error: `unsupported audio extension ${extname(c.audioPath!)}`,
          durationMs: 0,
        });
        continue;
      }
      const audio = await readFile(c.audioPath!);
      for (let run = 1; run <= repeat; run++) {
        const started = Date.now();
        try {
          const { text } = await service.transcribe({
            audio,
            mimeType,
            language: c.scanLanguage,
            otherLanguages: SCAN_LANGUAGES.filter((l) => l !== c.scanLanguage),
          });
          results.push({
            caseId: c.id,
            scanLanguage: c.scanLanguage,
            ok: true,
            transcript: text.trim(),
            expected: c.transcript,
            comparison: compareTranscripts(c.transcript, text),
            durationMs: Date.now() - started,
          });
        } catch (error) {
          results.push({
            caseId: c.id,
            scanLanguage: c.scanLanguage,
            ok: false,
            error: describe(error),
            durationMs: Date.now() - started,
          });
        }
        console.log(
          `  ${c.id} run ${run}: ${results[results.length - 1].ok ? 'ok' : 'failed'}`,
        );
      }
    }
    const report = renderTranscriptionReport({ model, results });
    const outDir = join(outRoot, `${stamp}-voice-transcribe-${slug(model)}`);
    await mkdir(outDir, { recursive: true });
    await writeFile(join(outDir, 'report.md'), report);
    await writeFile(
      join(outDir, 'results.json'),
      `${JSON.stringify(results, null, 2)}\n`,
    );
    console.log(`Report: ${join(outDir, 'report.md')}`);
    console.log(report.split('\n')[2]);
    return;
  }

  const model = values.model ?? env('AI_TEXT_MODEL') ?? DEFAULT_TEXT_MODEL;
  // `unset` replays without a reasoning effort. The default effort belongs to the default model, as in validateEnv.
  const effortLabel =
    values.effort ??
    env('AI_TEXT_REASONING_EFFORT') ??
    (model === DEFAULT_TEXT_MODEL ? DEFAULT_TEXT_REASONING_EFFORT : 'unset');
  const effort =
    effortLabel === 'unset'
      ? undefined
      : (REASONING_EFFORTS as readonly string[]).includes(effortLabel)
        ? (effortLabel as ReasoningEffort)
        : fail(
            `--effort must be one of ${REASONING_EFFORTS.join(', ')} or unset.`,
          );
  let prices: Price | undefined;
  if (values.price) {
    const [input, cachedInput, output] = values.price.split(',').map(Number);
    if ([input, cachedInput, output].some((n) => !Number.isFinite(n))) {
      fail(
        '--price must be <input>,<cachedInput>,<output> in USD per 1M tokens.',
      );
    }
    prices = { input, cachedInput, output };
  }
  const settings: Partial<AppConfig> = {
    NODE_ENV: 'test',
    AI_PROVIDER: provider,
    AI_API_KEY: apiKey,
    AI_BASE_URL: env('AI_BASE_URL'),
    AI_TEXT_MODEL: model,
    AI_TEXT_REASONING_EFFORT: effort,
  };
  const service = new StructuredOutputAiService({
    get: (key: keyof AppConfig) => settings[key],
  } as ConfigService<AppConfig, true>);
  const threshold = Number(env('SCAN_MATCH_CONFIDENCE_THRESHOLD') ?? 0.6);
  console.log(
    `Replaying the transcript read of ${cases.length} case(s) on ${model} (effort ${effortLabel}), ${repeat} run(s) each.`,
  );
  const results: ReadRunResult[] = [];
  const answers: Record<string, ReplayRun[]> = {};
  for (const c of cases) {
    const request = requestFor(c, set.catalog);
    answers[c.id] = [];
    for (let run = 1; run <= repeat; run++) {
      const started = Date.now();
      let replay: ReplayRun;
      try {
        const result = await service.generate(request);
        replay = {
          ok: true,
          data: result.data,
          usage: result.usage,
          durationMs: Date.now() - started,
        };
      } catch (error) {
        replay = {
          ok: false,
          error: describe(error),
          durationMs: Date.now() - started,
        };
      }
      answers[c.id].push(replay);
      results.push(evaluateReadRun(c, set.catalog, run, replay, threshold));
      console.log(`  ${c.id} run ${run}: ${replay.ok ? 'ok' : 'failed'}`);
    }
  }
  const report = renderReadReport({
    model,
    effort: effortLabel,
    repeat,
    results,
    prices,
  });
  const outDir = join(
    outRoot,
    `${stamp}-voice-read-${slug(model)}-${effortLabel}`,
  );
  await mkdir(outDir, { recursive: true });
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
